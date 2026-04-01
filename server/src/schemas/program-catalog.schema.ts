import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type ProgramCatalogDocument = ProgramCatalog & Document;

@Schema({ timestamps: true })
export class ProgramCatalog {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ default: "" })
  logo: string;

  @Prop({ required: true })
  currency: string; // 'Points', 'Miles'

  @Prop({ type: [String], default: [] })
  tiers: string[];

  @Prop({ required: true, default: 0.01 })
  aedRate: number; // 1 unit of this program = X AED

  @Prop({ required: true, default: "#6C63FF" })
  brandColor: string; // Hex color for UI display
}

export const ProgramCatalogSchema =
  SchemaFactory.createForClass(ProgramCatalog);
