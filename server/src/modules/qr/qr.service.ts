import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { createHmac } from "crypto";
import { nanoid } from "nanoid";
import { QrSessionDocument } from "../../schemas/qr-session.schema";
import { WalletDocument } from "../../schemas/wallet.schema";
import { ConfigService } from "../../config/config.service";

export interface HmacQrPayload {
  uid: string;       // userId
  mid: string | null; // merchantId
  typ: string;       // earn | redeem | general
  amt: number | null; // amount (points for redeem, null for earn)
  nonce: string;     // nanoid for replay prevention
  exp: number;       // expiry timestamp (ms)
  sig: string;       // HMAC-SHA256 signature
}

@Injectable()
export class QrService {
  constructor(
    @InjectModel("QrSession")
    private qrSessionModel: Model<QrSessionDocument>,
    @InjectModel("Wallet")
    private walletModel: Model<WalletDocument>,
    private configService: ConfigService,
  ) {}

  private signPayload(data: Omit<HmacQrPayload, "sig">): string {
    const message = `${data.uid}:${data.mid}:${data.typ}:${data.amt}:${data.nonce}:${data.exp}`;
    return createHmac("sha256", this.configService.qrHmacSecret)
      .update(message)
      .digest("hex");
  }

  verifySignature(payload: HmacQrPayload): boolean {
    const { sig, ...data } = payload;
    const expected = this.signPayload(data);
    return sig === expected;
  }

  async createSession(
    userId: string,
    dto: { type?: string; merchantId?: string; amount?: number },
  ) {
    const nonce = nanoid(12);
    const exp = Date.now() + 5 * 60 * 1000; // 5 minutes
    const type = dto.type || "general";
    const merchantId = dto.merchantId || null;
    const amount = dto.amount || null;

    // Build HMAC payload
    const payloadData = {
      uid: userId,
      mid: merchantId,
      typ: type,
      amt: amount,
      nonce,
      exp,
    };
    const sig = this.signPayload(payloadData);
    const hmacPayload: HmacQrPayload = { ...payloadData, sig };

    // Also store in DB for replay prevention and lookup
    const session = await this.qrSessionModel.create({
      type,
      userId: new Types.ObjectId(userId),
      merchantId: merchantId ? new Types.ObjectId(merchantId) : null,
      token: nonce, // use nonce as the unique token
      amount,
      status: "pending",
      expiresAt: new Date(exp),
    });

    return {
      session,
      hmacPayload, // client encodes this as QR content
    };
  }

  async verifyAndLookup(payload: HmacQrPayload) {
    // Step 1: Stateless HMAC verification
    if (!this.verifySignature(payload)) {
      throw new BadRequestException("Invalid QR signature — tampered payload");
    }

    // Step 2: Check expiry
    if (Date.now() > payload.exp) {
      throw new BadRequestException("QR code expired");
    }

    // Step 3: Check nonce in DB for replay prevention
    const session = await this.qrSessionModel
      .findOne({ token: payload.nonce })
      .populate("userId", "name email")
      .populate("merchantId", "name");

    if (!session) throw new NotFoundException("QR session not found");
    if (session.status === "completed") {
      throw new BadRequestException("QR code already used");
    }

    // Attach member balance for staff-side display
    let easyPointsBalance = 0;
    try {
      const wallet = await this.walletModel.findOne({
        userId: session.userId._id || session.userId,
        merchantId: null,
      });
      easyPointsBalance = wallet?.balance ?? 0;
    } catch (_) {}

    const sessionObj = session.toObject();
    return { ...sessionObj, easyPointsBalance };
  }

  // Legacy lookup by plain token (backward compat for existing sessions)
  async lookupSession(token: string) {
    // Try parsing as HMAC JSON payload first
    try {
      const payload = JSON.parse(token) as HmacQrPayload;
      if (payload.sig && payload.nonce) {
        return this.verifyAndLookup(payload);
      }
    } catch (_) {
      // Not JSON — treat as legacy plain token
    }

    // Legacy: plain 6-char token lookup
    const session = await this.qrSessionModel
      .findOne({ token: token.toUpperCase() })
      .populate("userId", "name email")
      .populate("merchantId", "name");

    if (!session) throw new NotFoundException("QR session not found");
    if (session.status === "completed")
      throw new BadRequestException("Session already completed");
    if (session.status === "expired" || session.expiresAt < new Date())
      throw new BadRequestException("Session expired");

    let easyPointsBalance = 0;
    try {
      const wallet = await this.walletModel.findOne({
        userId: session.userId._id || session.userId,
        merchantId: null,
      });
      easyPointsBalance = wallet?.balance ?? 0;
    } catch (_) {}

    const sessionObj = session.toObject();
    return { ...sessionObj, easyPointsBalance };
  }

  async completeSession(token: string) {
    const session = await this.qrSessionModel.findOne({
      token: token.toUpperCase(),
    });
    if (!session) {
      // Try by nonce (HMAC sessions use nonce as token)
      const byNonce = await this.qrSessionModel.findOne({ token });
      if (!byNonce) throw new NotFoundException("QR session not found");
      byNonce.status = "completed";
      await byNonce.save();
      return byNonce;
    }

    session.status = "completed";
    await session.save();
    return session;
  }
}
