import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { DeviceTokenDocument } from "../../schemas/device-token.schema";

@Injectable()
export class PushService {
  private readonly logger = new Logger(PushService.name);

  constructor(
    @InjectModel("DeviceToken") private deviceTokenModel: Model<DeviceTokenDocument>,
  ) {}

  async registerToken(userId: string, token: string, platform: "ios" | "android") {
    await this.deviceTokenModel.findOneAndUpdate(
      { token },
      { userId: new Types.ObjectId(userId), token, platform },
      { upsert: true },
    );
    return { registered: true };
  }

  async removeToken(token: string) {
    await this.deviceTokenModel.deleteOne({ token });
    return { removed: true };
  }

  async sendToUser(userId: string, title: string, body: string, data?: any) {
    const tokens = await this.deviceTokenModel.find({
      userId: new Types.ObjectId(userId),
    });

    if (tokens.length === 0) {
      this.logger.debug(`No device tokens for user ${userId}`);
      return;
    }

    // Firebase Admin SDK integration — will be activated when firebase-admin is configured
    // For now, log the push notification
    for (const dt of tokens) {
      this.logger.log(`[PUSH] ${dt.platform}:${dt.token.substring(0, 10)}... → ${title}: ${body}`);
    }

    // TODO: When firebase-admin is configured:
    // const message = { notification: { title, body }, data, tokens: tokens.map(t => t.token) };
    // await admin.messaging().sendEachForMulticast(message);
  }

  async getTokensForUser(userId: string) {
    return this.deviceTokenModel.find({ userId: new Types.ObjectId(userId) });
  }
}
