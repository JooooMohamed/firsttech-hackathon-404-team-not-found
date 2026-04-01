import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type TransactionDocument = Transaction & Document;

@Schema({ timestamps: true })
export class Transaction {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Merchant", required: true })
  merchantId: Types.ObjectId;

  @Prop({ required: true, enum: ["earn", "redeem"] })
  type: string;

  @Prop({ required: true })
  points: number;

  @Prop({ type: Number, default: null })
  amountAed: number | null; // bill amount for earn transactions

  @Prop({ type: String, default: null })
  reference: string | null; // QR session token
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);
TransactionSchema.index({ userId: 1 });
TransactionSchema.index({ merchantId: 1 });
TransactionSchema.index({ createdAt: -1 });
TransactionSchema.index({ userId: 1, merchantId: 1, type: 1 }); // Compound index for cross-SME checks
