import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type FeatureFlagDocument = FeatureFlag & Document;

@Schema({ timestamps: true })
export class FeatureFlag {
  @Prop({ required: true, unique: true })
  key: string;

  @Prop({ required: true })
  name: string;

  @Prop({ default: "" })
  description: string;

  @Prop({ default: false })
  enabled: boolean;

  @Prop({ type: [Object], default: [] })
  variants: { id: string; name: string; weight: number; config: any }[];

  @Prop({ type: Object, default: {} })
  targetRules: {
    tiers?: string[];
    percentage?: number;
    userIds?: string[];
  };

  @Prop({ type: Types.ObjectId, ref: "User" })
  createdBy: Types.ObjectId;
}

export const FeatureFlagSchema = SchemaFactory.createForClass(FeatureFlag);
