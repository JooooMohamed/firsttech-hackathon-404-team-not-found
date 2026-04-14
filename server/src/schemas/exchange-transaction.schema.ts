import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type ExchangeTransactionDocument = ExchangeTransaction & Document;

@Schema({ timestamps: true })
export class ExchangeTransaction {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId;

  @Prop({ required: true, enum: ["partner", "ep"] })
  sourceType: string;

  @Prop({ type: Types.ObjectId, ref: "LinkedProgram" })
  sourceProgramId: Types.ObjectId;

  @Prop({ required: true })
  sourceAmount: number;

  @Prop({ required: true, enum: ["partner", "ep"] })
  targetType: string;

  @Prop({ type: Types.ObjectId, ref: "LinkedProgram" })
  targetProgramId: Types.ObjectId;

  @Prop({ required: true })
  targetAmount: number;

  @Prop({ required: true })
  epuAmountIntermediate: number; // value in EPU during conversion

  @Prop({ required: true })
  feeEpu: number;

  @Prop({ required: true })
  feePercent: number;

  @Prop({ default: "completed", enum: ["completed", "failed"] })
  status: string;

  @Prop()
  txRef: string; // links to ledger entries
}

export const ExchangeTransactionSchema = SchemaFactory.createForClass(ExchangeTransaction);

ExchangeTransactionSchema.index({ userId: 1, createdAt: -1 });
