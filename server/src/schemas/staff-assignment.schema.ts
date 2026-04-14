import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type StaffAssignmentDocument = StaffAssignment & Document;

@Schema({ timestamps: true })
export class StaffAssignment {
  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: "Merchant", required: true })
  merchantId: Types.ObjectId;

  @Prop({ required: true, enum: ["owner", "staff"], default: "staff" })
  role: string;
}

export const StaffAssignmentSchema = SchemaFactory.createForClass(StaffAssignment);

StaffAssignmentSchema.index({ userId: 1, merchantId: 1 }, { unique: true });
StaffAssignmentSchema.index({ userId: 1 });
