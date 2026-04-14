import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type TierConfigDocument = TierConfig & Document;

@Schema({ timestamps: true })
export class TierConfig {
  @Prop({ required: true, unique: true })
  name: string; // Bronze, Silver, Gold, Platinum

  @Prop({ required: true })
  minLifetimeEP: number;

  @Prop({ required: true, default: 1 })
  earnMultiplier: number;

  @Prop({ type: [String], default: [] })
  perks: string[];

  @Prop({ default: "" })
  badgeEmoji: string;

  @Prop({ default: 0 })
  sortOrder: number;
}

export const TierConfigSchema = SchemaFactory.createForClass(TierConfig);
