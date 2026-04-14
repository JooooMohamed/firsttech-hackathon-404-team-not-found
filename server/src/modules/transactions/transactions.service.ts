import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { TransactionDocument } from "../../schemas/transaction.schema";
import { QrSessionDocument } from "../../schemas/qr-session.schema";
import { OfferDocument } from "../../schemas/offer.schema";
import { UserDocument } from "../../schemas/user.schema";
import { WalletsService } from "../wallets/wallets.service";
import { MerchantsService } from "../merchants/merchants.service";
import {
  buildCursorFilter,
  buildCursorResult,
  CursorPaginatedResult,
} from "../../common/cursor-pagination";
import { EventsService, EVENTS } from "../events/events.service";
import { TiersService } from "../tiers/tiers.service";

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel("Transaction")
    private transactionModel: Model<TransactionDocument>,
    @InjectModel("QrSession")
    private qrSessionModel: Model<QrSessionDocument>,
    @InjectModel("Offer")
    private offerModel: Model<OfferDocument>,
    @InjectModel("User")
    private userModel: Model<UserDocument>,
    @InjectModel("LinkedProgram")
    private linkedProgramModel: Model<any>,
    private walletsService: WalletsService,
    private merchantsService: MerchantsService,
    private eventsService: EventsService,
    private tiersService: TiersService,
  ) {}

  async earn(dto: {
    merchantId: string;
    userId: string;
    amountAed: number;
    qrToken?: string;
  }) {
    const merchant = await this.merchantsService.findById(dto.merchantId);

    // Check merchant is active
    if (merchant.status === "PAUSED") {
      throw new BadRequestException("This merchant is currently paused and cannot process transactions");
    }

    // Enforce integer AED amounts
    const amountAed = Math.floor(dto.amountAed);

    // I3: Enforce minimum spend if configured
    if (merchant.minSpend > 0 && amountAed < merchant.minSpend) {
      throw new BadRequestException(
        `Minimum spend is ${merchant.minSpend} AED to earn points at this merchant`,
      );
    }

    // I3: Apply earnRate * bonusMultiplier
    const multiplier = merchant.bonusMultiplier || 1;
    const basePoints = Math.floor(amountAed * merchant.earnRate * multiplier);

    // ── Apply active bonus offers ────────────────────────
    const now = new Date();
    const activeOffers = await this.offerModel.find({
      merchantId: new Types.ObjectId(dto.merchantId),
      isActive: true,
      type: "bonus",
      startsAt: { $lte: now },
      endsAt: { $gte: now },
    });
    let offerMultiplier = 1;
    let flatBonus = 0;
    const appliedOffers: string[] = [];
    for (const offer of activeOffers) {
      // value <= 10 means it's a multiplier (2x, 3x), otherwise it's flat bonus
      if (offer.value <= 10) {
        offerMultiplier = Math.max(offerMultiplier, offer.value);
      } else {
        flatBonus += offer.value; // flat bonus EP
      }
      appliedOffers.push(offer.title);
    }
    const bonusPoints =
      offerMultiplier > 1
        ? Math.floor(basePoints * offerMultiplier) - basePoints + flatBonus
        : flatBonus;
    const points = basePoints + bonusPoints;

    if (points <= 0) {
      throw new BadRequestException("Amount too small to earn points");
    }

    // Validate QR token if provided; derive userId from session to prevent IDOR
    let userId = dto.userId;
    if (dto.qrToken) {
      const session = await this.qrSessionModel.findOne({
        token: dto.qrToken.toUpperCase(),
      });
      if (!session) throw new BadRequestException("Invalid QR token");
      if (session.status === "completed")
        throw new BadRequestException("QR session already used");
      if (session.expiresAt < new Date())
        throw new BadRequestException("QR session expired");
      // If session has a merchantId, verify it matches (backward compat)
      if (
        session.merchantId &&
        session.merchantId.toString() !== dto.merchantId
      )
        throw new BadRequestException("QR token does not match this merchant");

      // IDOR fix: override userId from trusted QR session
      userId = session.userId.toString();

      // Mark session completed to prevent replay
      session.status = "completed";
      await session.save();
    }

    // Apply tier multiplier
    const tierMultiplier = this.tiersService.getTierMultiplier(
      (await this.userModel.findById(userId))?.lifetimeEP || 0,
    );
    const tierBonus = tierMultiplier > 1 ? Math.floor(points * (tierMultiplier - 1)) : 0;
    const finalPoints = points + tierBonus;

    // Update global wallet (null merchantId)
    await this.walletsService.addPoints(userId, null, finalPoints);

    // Track lifetime EP and check for tier upgrade
    await this.userModel.findByIdAndUpdate(userId, { $inc: { lifetimeEP: finalPoints } });
    const tierUpgrade = await this.tiersService.checkAndUpgradeTier(userId);

    // Create transaction
    const transaction = await this.transactionModel.create({
      userId: new Types.ObjectId(userId),
      merchantId: new Types.ObjectId(dto.merchantId),
      type: "earn",
      points: finalPoints,
      amountAed: amountAed,
      reference: dto.qrToken,
    });

    // C3: Dual earning — also credit partner program if merchant is linked
    let dualEarnInfo: any = undefined;
    if (merchant.partnerProgramId) {
      try {
        const linkedProgram = await this.linkedProgramModel?.findOne({
          userId: new Types.ObjectId(userId),
          programName: { $exists: true },
        });
        // Credit partner program balance (simulated — real API in future)
        if (linkedProgram) {
          const partnerPoints = Math.floor(amountAed * (linkedProgram.aedRate || 0.01) * 100);
          if (partnerPoints > 0) {
            linkedProgram.balance += partnerPoints;
            await linkedProgram.save();
            dualEarnInfo = {
              programName: linkedProgram.programName,
              partnerPoints,
              currency: linkedProgram.currency,
            };
          }
        }
      } catch (_) {}
    }

    const result = {
      transaction,
      pointsEarned: basePoints,
      bonusPoints: bonusPoints > 0 ? bonusPoints : undefined,
      tierBonus: tierBonus > 0 ? tierBonus : undefined,
      totalPoints: finalPoints,
      amountAed: amountAed,
      earnRate: merchant.earnRate,
      appliedOffers: appliedOffers.length > 0 ? appliedOffers : undefined,
      offerMultiplier: offerMultiplier > 1 ? offerMultiplier : undefined,
      tierMultiplier: tierMultiplier > 1 ? tierMultiplier : undefined,
      tierUpgrade: tierUpgrade.upgraded ? tierUpgrade.newTier : undefined,
      dualEarn: dualEarnInfo,
    };

    // Emit real-time events
    this.eventsService.emitToUser(userId, EVENTS.TRANSACTION_COMPLETED, result);
    this.eventsService.emitToMerchant(dto.merchantId, EVENTS.TRANSACTION_COMPLETED, result);

    return result;
  }

  async redeem(dto: {
    merchantId: string;
    userId: string;
    points: number;
    qrToken?: string;
  }) {
    const merchant = await this.merchantsService.findById(dto.merchantId);

    // Check merchant is active
    if (merchant.status === "PAUSED") {
      throw new BadRequestException("This merchant is currently paused and cannot process transactions");
    }

    if (!merchant.redemptionEnabled) {
      throw new BadRequestException("Redemption not enabled for this merchant");
    }

    // Validate QR token if provided; derive userId from session to prevent IDOR
    let userId = dto.userId;
    if (dto.qrToken) {
      const session = await this.qrSessionModel.findOne({
        token: dto.qrToken.toUpperCase(),
      });
      if (!session) throw new BadRequestException("Invalid QR token");
      if (session.status === "completed")
        throw new BadRequestException("QR session already used");
      if (session.expiresAt < new Date())
        throw new BadRequestException("QR session expired");
      // If session has a merchantId, verify it matches (backward compat)
      if (
        session.merchantId &&
        session.merchantId.toString() !== dto.merchantId
      )
        throw new BadRequestException("QR token does not match this merchant");

      // IDOR fix: override userId from trusted QR session
      userId = session.userId.toString();

      // Mark session completed to prevent replay
      session.status = "completed";
      await session.save();
    }

    // I5: If merchant doesn't allow cross-SME redemption, check user earned here
    if (!merchant.crossSmeRedemption) {
      const earnedHere = await this.transactionModel.aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId),
            merchantId: new Types.ObjectId(dto.merchantId),
            type: "earn",
          },
        },
        { $group: { _id: null, total: { $sum: "$points" } } },
      ]);
      const earnedRedeemHere = await this.transactionModel.aggregate([
        {
          $match: {
            userId: new Types.ObjectId(userId),
            merchantId: new Types.ObjectId(dto.merchantId),
            type: "redeem",
          },
        },
        { $group: { _id: null, total: { $sum: "$points" } } },
      ]);
      const netEarned =
        (earnedHere[0]?.total || 0) - (earnedRedeemHere[0]?.total || 0);
      if (dto.points > netEarned) {
        throw new BadRequestException(
          `This merchant only allows redeeming points earned here. You have ${netEarned} EP available from this merchant.`,
        );
      }
    }

    // Deduct from global wallet
    await this.walletsService.deductPoints(userId, null, dto.points);

    // Create transaction
    const transaction = await this.transactionModel.create({
      userId: new Types.ObjectId(userId),
      merchantId: new Types.ObjectId(dto.merchantId),
      type: "redeem",
      points: dto.points,
      amountAed: null,
      reference: dto.qrToken,
    });

    const redeemResult = { transaction, pointsRedeemed: dto.points };

    // Emit real-time events
    this.eventsService.emitToUser(userId, EVENTS.TRANSACTION_COMPLETED, redeemResult);
    this.eventsService.emitToMerchant(dto.merchantId, EVENTS.TRANSACTION_COMPLETED, redeemResult);

    return redeemResult;
  }

  async getByUserId(
    userId: string,
    options: {
      cursor?: string;
      limit?: number;
      page?: number; // legacy fallback
      startDate?: string;
      endDate?: string;
    } = {},
  ): Promise<CursorPaginatedResult<any>> {
    const limit = Math.min(Math.max(options.limit || 20, 1), 100);
    const baseFilter: any = { userId: new Types.ObjectId(userId) };
    if (options.startDate || options.endDate) {
      baseFilter.createdAt = {};
      if (options.startDate) baseFilter.createdAt.$gte = new Date(options.startDate);
      if (options.endDate) {
        const end = new Date(options.endDate);
        end.setHours(23, 59, 59, 999);
        baseFilter.createdAt.$lte = end;
      }
    }

    // Legacy offset fallback
    if (!options.cursor && options.page) {
      const skip = (options.page - 1) * limit;
      const items = await this.transactionModel
        .find(baseFilter)
        .populate("merchantId", "name logo")
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);
      return { items, nextCursor: null, hasMore: false };
    }

    const filter = buildCursorFilter(baseFilter, options.cursor, -1);
    const items = await this.transactionModel
      .find(filter)
      .populate("merchantId", "name logo")
      .sort({ _id: -1 })
      .limit(limit + 1);

    return buildCursorResult(items, limit);
  }

  // Member Insights — month EP earned / redeemed / top merchant / txn count
  async getUserInsights(userId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const pipeline = [
      {
        $match: {
          userId: new Types.ObjectId(userId),
          createdAt: { $gte: thirtyDaysAgo },
        },
      },
      {
        $group: {
          _id: { type: "$type", merchantId: "$merchantId" },
          total: { $sum: "$points" },
          count: { $sum: 1 },
        },
      },
    ];

    const raw = await this.transactionModel.aggregate(pipeline);

    let earned = 0;
    let redeemed = 0;
    let txCount = 0;
    const merchantEarns: Record<string, number> = {};

    for (const r of raw) {
      txCount += r.count;
      if (r._id.type === "earn") {
        earned += r.total;
        const mid = r._id.merchantId.toString();
        merchantEarns[mid] = (merchantEarns[mid] || 0) + r.total;
      } else {
        redeemed += r.total;
      }
    }

    let topMerchant: { name: string; logo: string; points: number } | null =
      null;
    if (Object.keys(merchantEarns).length > 0) {
      const topId = Object.entries(merchantEarns).sort(
        (a, b) => b[1] - a[1],
      )[0][0];
      const merchant = await this.merchantsService.findById(topId);
      topMerchant = {
        name: merchant.name,
        logo: merchant.logo,
        points: merchantEarns[topId],
      };
    }

    return { earned, redeemed, txCount, topMerchant };
  }

  async getByMerchantId(
    merchantId: string,
    options: { cursor?: string; limit?: number; page?: number } = {},
  ): Promise<CursorPaginatedResult<any>> {
    const limit = Math.min(Math.max(options.limit || 20, 1), 100);
    const baseFilter = { merchantId: new Types.ObjectId(merchantId) };

    if (!options.cursor && options.page) {
      const skip = (options.page - 1) * limit;
      const items = await this.transactionModel
        .find(baseFilter)
        .populate("userId", "name email")
        .sort({ _id: -1 })
        .skip(skip)
        .limit(limit);
      return { items, nextCursor: null, hasMore: false };
    }

    const filter = buildCursorFilter(baseFilter, options.cursor, -1);
    const items = await this.transactionModel
      .find(filter)
      .populate("userId", "name email")
      .sort({ _id: -1 })
      .limit(limit + 1);

    return buildCursorResult(items, limit);
  }

  async getMerchantStats(merchantId: string) {
    // Use MongoDB aggregation — efficient even with large datasets
    const pipeline = [
      { $match: { merchantId: new Types.ObjectId(merchantId) } },
      {
        $group: {
          _id: null,
          totalPointsIssued: {
            $sum: { $cond: [{ $eq: ["$type", "earn"] }, "$points", 0] },
          },
          totalPointsRedeemed: {
            $sum: { $cond: [{ $eq: ["$type", "redeem"] }, "$points", 0] },
          },
          totalTransactions: { $sum: 1 },
          activeMembers: { $addToSet: "$userId" },
        },
      },
      {
        $project: {
          _id: 0,
          totalPointsIssued: 1,
          totalPointsRedeemed: 1,
          totalTransactions: 1,
          activeMembers: { $size: "$activeMembers" },
        },
      },
    ];

    const [result] = await this.transactionModel.aggregate(pipeline);
    return (
      result || {
        totalPointsIssued: 0,
        totalPointsRedeemed: 0,
        totalTransactions: 0,
        activeMembers: 0,
      }
    );
  }

  async getDailyStats(merchantId: string, days = 7) {
    const since = new Date();
    since.setDate(since.getDate() - days);

    const pipeline = [
      {
        $match: {
          merchantId: new Types.ObjectId(merchantId),
          createdAt: { $gte: since },
        },
      },
      {
        $group: {
          _id: {
            date: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            type: "$type",
          },
          total: { $sum: "$points" },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.date": 1 as 1 } },
    ];

    const raw = await this.transactionModel.aggregate(pipeline);

    // Build day-by-day results
    const result: {
      date: string;
      earned: number;
      redeemed: number;
      txCount: number;
    }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const earnEntry = raw.find(
        (r) => r._id.date === dateStr && r._id.type === "earn",
      );
      const redeemEntry = raw.find(
        (r) => r._id.date === dateStr && r._id.type === "redeem",
      );
      result.push({
        date: dateStr,
        earned: earnEntry?.total || 0,
        redeemed: redeemEntry?.total || 0,
        txCount: (earnEntry?.count || 0) + (redeemEntry?.count || 0),
      });
    }
    return result;
  }

  async exportMerchantCsv(merchantId: string): Promise<string> {
    const transactions = await this.transactionModel
      .find({ merchantId: new Types.ObjectId(merchantId) })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .lean();

    const header =
      "Date,Type,Customer,Customer Email,Amount (AED),Points,Reference\n";
    const rows = transactions.map((t: any) => {
      const date = new Date(t.createdAt).toISOString().split("T")[0];
      const type = t.type === "earn" ? "Earned" : "Redeemed";
      const customerName = t.userId?.name || "Unknown";
      const customerEmail = t.userId?.email || "Unknown";
      const amount = t.amountAed != null ? t.amountAed.toFixed(2) : "";
      const points = t.type === "earn" ? `+${t.points}` : `-${t.points}`;
      const ref = t.reference || "";
      return `${date},${type},"${customerName}",${customerEmail},${amount},${points},${ref}`;
    });

    return header + rows.join("\n");
  }

  async exportUserCsv(userId: string): Promise<string> {
    const transactions = await this.transactionModel
      .find({ userId: new Types.ObjectId(userId) })
      .populate("merchantId", "name logo")
      .sort({ createdAt: -1 })
      .lean();

    const header = "Date,Type,Merchant,Amount (AED),Points,Reference\n";
    const rows = transactions.map((t: any) => {
      const date = new Date(t.createdAt).toISOString().split("T")[0];
      const type = t.type === "earn" ? "Earned" : "Redeemed";
      const merchantName = t.merchantId?.name || "Unknown";
      const amount = t.amountAed != null ? t.amountAed.toFixed(2) : "";
      const points = t.type === "earn" ? `+${t.points}` : `-${t.points}`;
      const ref = t.reference || "";
      return `${date},${type},"${merchantName}",${amount},${points},${ref}`;
    });

    return header + rows.join("\n");
  }
}
