import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { CampaignDocument } from "../../schemas/campaign.schema";

@Injectable()
export class CampaignsService {
  constructor(
    @InjectModel("Campaign") private campaignModel: Model<CampaignDocument>,
  ) {}

  async create(dto: any, createdBy: string) {
    return this.campaignModel.create({
      ...dto,
      merchantId: new Types.ObjectId(dto.merchantId),
      createdBy: new Types.ObjectId(createdBy),
    });
  }

  async findActive() {
    const now = new Date();
    return this.campaignModel
      .find({
        status: "active",
        startsAt: { $lte: now },
        endsAt: { $gte: now },
      })
      .populate("merchantId", "name logo category")
      .sort({ endsAt: 1 });
  }

  async findByMerchant(merchantId: string) {
    return this.campaignModel
      .find({ merchantId: new Types.ObjectId(merchantId) })
      .sort({ createdAt: -1 });
  }

  async update(id: string, dto: any) {
    const campaign = await this.campaignModel.findByIdAndUpdate(id, dto, { new: true });
    if (!campaign) throw new NotFoundException("Campaign not found");
    return campaign;
  }

  async delete(id: string) {
    await this.campaignModel.findByIdAndDelete(id);
    return { deleted: true };
  }

  async getApplicableCampaigns(
    merchantId: string,
    userTier?: string,
    amountAed?: number,
  ) {
    const now = new Date();
    const dayOfWeek = now.getDay();

    const campaigns = await this.campaignModel.find({
      merchantId: new Types.ObjectId(merchantId),
      status: "active",
      startsAt: { $lte: now },
      endsAt: { $gte: now },
    });

    return campaigns.filter((c) => {
      const rules = c.rules || {};
      if (rules.minSpend && amountAed && amountAed < rules.minSpend) return false;
      if (rules.maxUses && c.currentUses >= rules.maxUses) return false;
      if (rules.targetTiers?.length && userTier && !rules.targetTiers.includes(userTier)) return false;
      if (rules.dayOfWeek?.length && !rules.dayOfWeek.includes(dayOfWeek)) return false;
      return true;
    });
  }

  async incrementUsage(campaignId: string) {
    await this.campaignModel.findByIdAndUpdate(campaignId, { $inc: { currentUses: 1 } });
  }
}
