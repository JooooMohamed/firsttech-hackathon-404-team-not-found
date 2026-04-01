import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type QrSessionDocument = QrSession & Document;

@Schema({ timestamps: true })
export class QrSession {
  @Prop({ required: true, enum: ["earn", "redeem"] })
  type: string;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId; // the member

  @Prop({ type: Types.ObjectId, ref: "Merchant", required: true })
  merchantId: Types.ObjectId;

  @Prop({ required: true, unique: true })
  token: string; // 6-char code

  @Prop({ type: Number, default: null })
  amount: number | null; // for redeem: points to redeem

  @Prop({
    required: true,
    enum: ["pending", "completed", "expired"],
    default: "pending",
  })
  status: string;

  @Prop({ required: true })
  expiresAt: Date;
}

export const QrSessionSchema = SchemaFactory.createForClass(QrSession);
QrSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL: auto-delete expired sessions
