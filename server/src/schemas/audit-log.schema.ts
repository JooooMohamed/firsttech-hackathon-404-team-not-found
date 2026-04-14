import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";

export type AuditLogDocument = AuditLog & Document;

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ required: true })
  collection: string; // e.g. "merchants", "program_catalog"

  @Prop({ type: Types.ObjectId, required: true })
  documentId: Types.ObjectId;

  @Prop({ required: true })
  field: string;

  @Prop({ type: Object })
  oldValue: any;

  @Prop({ type: Object })
  newValue: any;

  @Prop({ type: Types.ObjectId, ref: "User", required: true })
  changedBy: Types.ObjectId;

  @Prop()
  reason: string;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

AuditLogSchema.index({ collection: 1, documentId: 1 });
AuditLogSchema.index({ changedBy: 1 });
AuditLogSchema.index({ createdAt: -1 });
