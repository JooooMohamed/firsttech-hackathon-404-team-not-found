import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type CampaignDocument = Campaign & Document;

@Schema({ timestamps: true })
export class Campaign {
  @Prop({ type: Types.ObjectId, ref: "Merchant", required: true })
  merchantId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop({ default: "" })
  description: string;

  @Prop({ required: true, enum: ["bonus_multiplier", "bonus_flat", "discount", "freebie", "cashback"] })
  type: string;

  @Prop({ required: true })
  value: number;

  @Prop({ type: Object, default: {} })
  rules: {
    minSpend?: number;
    maxUses?: number;
    targetTiers?: string[];
    dayOfWeek?: number[];
    geofence?: { lat: number; lng: number; radiusKm: number };
  };

  @Prop({ required: true })
  startsAt: Date;

  @Prop({ required: true })
  endsAt: Date;

  @Prop({ default: "draft", enum: ["draft", "active", "paused", "ended"] })
  status: string;

  @Prop({ default: 0 })
  currentUses: number;

  @Prop({ type: Types.ObjectId, ref: "User" })
  createdBy: Types.ObjectId;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);

CampaignSchema.index({ merchantId: 1, status: 1 });
CampaignSchema.index({ startsAt: 1, endsAt: 1 });
