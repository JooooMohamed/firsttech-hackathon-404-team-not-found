import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type LedgerEntryDocument = LedgerEntry & Document;

@Schema({ timestamps: true })
export class LedgerEntry {
  @Prop({ required: true })
  txRef: string; // groups debit+credit entries for the same exchange

  @Prop({ required: true, enum: ["user_ep", "user_partner", "merchant", "platform_fee"] })
  accountType: string;

  @Prop({ type: Types.ObjectId, required: true })
  accountId: Types.ObjectId; // userId or merchantId

  @Prop({ default: 0 })
  debit: number;

  @Prop({ default: 0 })
  credit: number;

  @Prop({ required: true })
  currency: string; // "EPU", "EP", or partner currency name

  @Prop()
  balanceBefore: number;

  @Prop()
  balanceAfter: number;

  @Prop()
  memo: string;
}

export const LedgerEntrySchema = SchemaFactory.createForClass(LedgerEntry);

LedgerEntrySchema.index({ txRef: 1 });
LedgerEntrySchema.index({ accountId: 1, accountType: 1 });
LedgerEntrySchema.index({ createdAt: -1 });
