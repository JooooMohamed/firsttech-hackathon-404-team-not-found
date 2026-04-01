import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { OfferDocument } from "../../schemas/offer.schema";

@Injectable()
export class OffersService {
  constructor(@InjectModel("Offer") private offerModel: Model<OfferDocument>) {}

  async create(dto: any) {
    return this.offerModel.create({
      ...dto,
      merchantId: new Types.ObjectId(dto.merchantId),
      startsAt: new Date(dto.startsAt),
      endsAt: new Date(dto.endsAt),
    });
  }

  async findByMerchant(merchantId: string) {
    return this.offerModel
      .find({ merchantId: new Types.ObjectId(merchantId) })
      .sort({ createdAt: -1 });
  }

  async findActive() {
    const now = new Date();
    return this.offerModel
      .find({
        isActive: true,
        startsAt: { $lte: now },
        endsAt: { $gte: now },
      })
      .populate("merchantId", "name logo category")
      .sort({ endsAt: 1 });
  }

  async findActiveByMerchant(merchantId: string) {
    const now = new Date();
    return this.offerModel
      .find({
        merchantId: new Types.ObjectId(merchantId),
        isActive: true,
        startsAt: { $lte: now },
        endsAt: { $gte: now },
      })
      .sort({ endsAt: 1 });
  }

  async update(id: string, dto: any) {
    const offer = await this.offerModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!offer) throw new NotFoundException("Offer not found");
    return offer;
  }

  async delete(id: string) {
    const offer = await this.offerModel.findByIdAndDelete(id);
    if (!offer) throw new NotFoundException("Offer not found");
    return { deleted: true };
  }
}
