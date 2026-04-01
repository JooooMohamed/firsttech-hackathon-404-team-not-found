import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type LinkedProgramDocument = LinkedProgram & Document;

@Schema({ timestamps: true })
export class LinkedProgram {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  programName: string;

  @Prop({ default: "" })
  programLogo: string;

  @Prop({ required: true, default: 0 })
  balance: number;

  @Prop({ default: "" })
  tier: string;

  @Prop({ required: true })
  currency: string;

  @Prop({ required: true, default: 0.01 })
  aedRate: number;

  @Prop({ required: true, default: "#6C63FF" })
  brandColor: string;
}

export const LinkedProgramSchema = SchemaFactory.createForClass(LinkedProgram);
