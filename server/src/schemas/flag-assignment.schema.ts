import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type FlagAssignmentDocument = FlagAssignment & Document;

@Schema({ timestamps: true })
export class FlagAssignment {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId;

  @Prop({ required: true })
  flagKey: string;

  @Prop({ required: true })
  variantId: string;
}

export const FlagAssignmentSchema = SchemaFactory.createForClass(FlagAssignment);

FlagAssignmentSchema.index({ userId: 1, flagKey: 1 }, { unique: true });
