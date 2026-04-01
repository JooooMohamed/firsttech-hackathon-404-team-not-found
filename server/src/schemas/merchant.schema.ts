import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type MerchantDocument = Merchant & Document;

@Schema({ timestamps: true })
export class Merchant {
  @Prop({ required: true })
  name: string;

  @Prop({ default: "" })
  logo: string;

  @Prop({ default: "" })
  category: string;

  @Prop({ default: "" })
  description: string;

  @Prop({ required: true, default: 10 })
  earnRate: number; // e.g. 10 = 1 AED spend = 10 EasyPoints

  @Prop({ default: 0 })
  minSpend: number; // minimum AED spend to earn points (0 = no minimum)

  @Prop({ default: 1 })
  bonusMultiplier: number; // multiplier on top of earnRate (e.g. 2 = double points)

  @Prop({ default: true })
  redemptionEnabled: boolean;

  @Prop({ default: true })
  crossSmeRedemption: boolean; // allow redeem with points earned elsewhere

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  ownerId: Types.ObjectId;
}

export const MerchantSchema = SchemaFactory.createForClass(Merchant);
