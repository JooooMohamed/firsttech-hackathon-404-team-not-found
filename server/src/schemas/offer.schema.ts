import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type OfferDocument = Offer & Document;

@Schema({ timestamps: true })
export class Offer {
  @Prop({ type: Types.ObjectId, ref: "Merchant", required: true })
  merchantId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ default: "" })
  description: string;

  @Prop({ required: true, enum: ["bonus", "discount", "freebie"] })
  type: string; // bonus = extra points multiplier, discount = reduced redeem cost, freebie = free item

  @Prop({ default: 2 })
  value: number; // e.g. 2 = 2x points for bonus, 50 = 50% off for discount

  @Prop({ required: true })
  startsAt: Date;

  @Prop({ required: true })
  endsAt: Date;

  @Prop({ default: true })
  isActive: boolean;
}

export const OfferSchema = SchemaFactory.createForClass(Offer);
OfferSchema.index({ merchantId: 1 });
OfferSchema.index({ endsAt: 1 });
