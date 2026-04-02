import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop()
  phone: string;

  @Prop({ required: true })
  password: string;

  @Prop({ type: [String], default: ["member"] })
  roles: string[];

  @Prop({ type: String, default: null })
  merchantId: string | null;

  @Prop({ default: false })
  consentGiven: boolean;

  @Prop({ type: Date, default: null })
  consentGivenAt: Date | null;

  @Prop({ unique: true, sparse: true })
  referralCode: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
