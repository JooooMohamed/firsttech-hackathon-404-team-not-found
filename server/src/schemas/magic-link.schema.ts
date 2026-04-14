import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type MagicLinkDocument = MagicLink & Document;

@Schema({ timestamps: true })
export class MagicLink {
  @Prop({ required: true })
  email: string;

  @Prop({ required: true, unique: true })
  token: string;

  @Prop({ required: true })
  expiresAt: Date;

  @Prop({ default: false })
  used: boolean;
}

export const MagicLinkSchema = SchemaFactory.createForClass(MagicLink);

// Auto-delete expired tokens after 1 hour
MagicLinkSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 3600 });
