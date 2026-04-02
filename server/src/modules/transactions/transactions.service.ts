import { Injectable, BadRequestException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { TransactionDocument } from "../../schemas/transaction.schema";
import { QrSessionDocument } from "../../schemas/qr-session.schema";
import { OfferDocument } from "../../schemas/offer.schema";
import { WalletsService } from "../wallets/wallets.service";
import { MerchantsService } from "../merchants/merchants.service";

@Injectable()
export class TransactionsService {
  constructor(
    @InjectModel("Transaction")
    private transactionModel: Model<TransactionDocument>,
    @InjectModel("QrSession")
    private qrSessionModel: Model<QrSessionDocument>,
    @InjectModel("Offer")
    private offerModel: Model<OfferDocument>,
    private walletsService: WalletsService,
    private merchantsService: MerchantsService,
  ) {}

  async earn(dto: {
    merchantId: string;
    userId: string;
    amountAed: number;
    qrToken?: string;
  }) {
    const merchant = await this.merchantsService.findById(dto.merchantId);

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

    // Update global wallet (null merchantId)
    await this.walletsService.addPoints(userId, null, points);

    // Create transaction
    const transaction = await this.transactionModel.create({
      userId: new Types.ObjectId(userId),
      merchantId: new Types.ObjectId(dto.merchantId),
      type: "earn",
      points,
      amountAed: amountAed,
      reference: dto.qrToken,
    });

    return {
      transaction,
      pointsEarned: basePoints,
      bonusPoints: bonusPoints > 0 ? bonusPoints : undefined,
      totalPoints: points,
      amountAed: amountAed,
      earnRate: merchant.earnRate,
      appliedOffers: appliedOffers.length > 0 ? appliedOffers : undefined,
      offerMultiplier: offerMultiplier > 1 ? offerMultiplier : undefined,
    };
  }

  async redeem(dto: {
    merchantId: string;
    userId: string;
    points: number;
    qrToken?: string;
  }) {
    const merchant = await this.merchantsService.findById(dto.merchantId);

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

    return {
      transaction,
      pointsRedeemed: dto.points,
    };
  }

  async getByUserId(
    userId: string,
    page = 1,
    limit = 50,
    startDate?: string,
    endDate?: string,
  ) {
    const skip = (page - 1) * limit;
    const filter: any = { userId: new Types.ObjectId(userId) };
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }
    return this.transactionModel
      .find(filter)
      .populate("merchantId", "name logo")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
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

  async getByMerchantId(merchantId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;
    return this.transactionModel
      .find({ merchantId: new Types.ObjectId(merchantId) })
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
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
