import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { WalletDocument } from "../../schemas/wallet.schema";

@Injectable()
export class WalletsService {
  constructor(
    @InjectModel("Wallet") private walletModel: Model<WalletDocument>,
  ) {}

  async getWalletsForUser(userId: string) {
    return this.walletModel.find({ userId: new Types.ObjectId(userId) });
  }

  async getGlobalWallet(userId: string) {
    return this.walletModel.findOne({
      userId: new Types.ObjectId(userId),
      merchantId: null,
    });
  }

  async getWalletForMerchant(userId: string, merchantId: string) {
    return this.walletModel.findOne({
      userId: new Types.ObjectId(userId),
      merchantId: new Types.ObjectId(merchantId),
    });
  }

  async addPoints(userId: string, merchantId: string | null, points: number) {
    const filter = merchantId
      ? {
          userId: new Types.ObjectId(userId),
          merchantId: new Types.ObjectId(merchantId),
        }
      : { userId: new Types.ObjectId(userId), merchantId: null };

    // Atomic upsert with $inc — no race condition
    const wallet = await this.walletModel.findOneAndUpdate(
      filter,
      {
        $inc: { balance: points },
        $setOnInsert: {
          userId: new Types.ObjectId(userId),
          merchantId: merchantId ? new Types.ObjectId(merchantId) : null,
        },
      },
      { upsert: true, new: true },
    );
    return wallet;
  }

  async deductPoints(
    userId: string,
    merchantId: string | null,
    points: number,
  ) {
    const filter = merchantId
      ? {
          userId: new Types.ObjectId(userId),
          merchantId: new Types.ObjectId(merchantId),
          balance: { $gte: points },
        }
      : {
          userId: new Types.ObjectId(userId),
          merchantId: null,
          balance: { $gte: points },
        };

    // Atomic deduct — balance check + decrement in one operation
    const wallet = await this.walletModel.findOneAndUpdate(
      filter,
      { $inc: { balance: -points } },
      { new: true },
    );

    if (!wallet) {
      // Check if wallet exists at all vs insufficient balance
      const exists = await this.walletModel.findOne(
        merchantId
          ? {
              userId: new Types.ObjectId(userId),
              merchantId: new Types.ObjectId(merchantId),
            }
          : { userId: new Types.ObjectId(userId), merchantId: null },
      );
      if (!exists) throw new NotFoundException("Wallet not found");
      throw new BadRequestException("Insufficient balance");
    }

    return wallet;
  }
}
