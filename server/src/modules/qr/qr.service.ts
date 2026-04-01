import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { randomBytes } from "crypto";
import { QrSessionDocument } from "../../schemas/qr-session.schema";

@Injectable()
export class QrService {
  constructor(
    @InjectModel("QrSession")
    private qrSessionModel: Model<QrSessionDocument>,
  ) {}

  private generateToken(): string {
    // Crypto-secure 6-character alphanumeric code
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // skip confusing chars
    const bytes = randomBytes(6);
    let token = "";
    for (let i = 0; i < 6; i++) {
      token += chars.charAt(bytes[i] % chars.length);
    }
    return token;
  }

  async createSession(
    userId: string,
    dto: { type: string; merchantId: string; amount?: number },
  ) {
    const token = this.generateToken();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    const session = await this.qrSessionModel.create({
      type: dto.type,
      userId: new Types.ObjectId(userId),
      merchantId: new Types.ObjectId(dto.merchantId),
      token,
      amount: dto.amount || null,
      status: "pending",
      expiresAt,
    });

    return session;
  }

  async lookupSession(token: string) {
    const session = await this.qrSessionModel
      .findOne({ token: token.toUpperCase() })
      .populate("userId", "name email")
      .populate("merchantId", "name");

    if (!session) throw new NotFoundException("QR session not found");
    if (session.status === "completed")
      throw new BadRequestException("Session already completed");
    if (session.status === "expired" || session.expiresAt < new Date())
      throw new BadRequestException("Session expired");

    return session;
  }

  async completeSession(token: string) {
    const session = await this.qrSessionModel.findOne({
      token: token.toUpperCase(),
    });
    if (!session) throw new NotFoundException("QR session not found");

    session.status = "completed";
    await session.save();
    return session;
  }
}
