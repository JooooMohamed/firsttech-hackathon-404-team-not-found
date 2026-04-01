import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MerchantDocument } from "../../schemas/merchant.schema";
import { UserDocument } from "../../schemas/user.schema";

@Injectable()
export class MerchantsService {
  constructor(
    @InjectModel("Merchant") private merchantModel: Model<MerchantDocument>,
    @InjectModel("User") private userModel: Model<UserDocument>,
  ) {}

  async findAll() {
    return this.merchantModel.find();
  }

  async findById(id: string) {
    const merchant = await this.merchantModel.findById(id);
    if (!merchant) throw new NotFoundException("Merchant not found");
    return merchant;
  }

  async create(ownerId: string, dto: any) {
    return this.merchantModel.create({ ...dto, ownerId });
  }

  async update(id: string, dto: any, user?: any) {
    // Ownership check: staff can only edit their assigned merchant
    if (
      user &&
      !user.roles?.includes("admin") &&
      user.merchantId?.toString() !== id
    ) {
      throw new BadRequestException("You can only edit your own merchant");
    }
    const merchant = await this.merchantModel.findByIdAndUpdate(id, dto, {
      new: true,
    });
    if (!merchant) throw new NotFoundException("Merchant not found");
    return merchant;
  }

  // C1: Self-service merchant registration — creates merchant + upgrades user to staff
  async registerMerchant(userId: string, dto: any) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new NotFoundException("User not found");
    if (user.merchantId) {
      throw new BadRequestException(
        "You are already linked to a merchant. Unlink first.",
      );
    }

    const merchant = await this.merchantModel.create({
      ...dto,
      ownerId: userId,
    });

    // Upgrade user: add "staff" role + link to new merchant
    const newRoles = Array.from(new Set([...user.roles, "staff"]));
    const updatedUser = await this.userModel
      .findByIdAndUpdate(
        userId,
        { roles: newRoles, merchantId: merchant._id },
        { new: true },
      )
      .select("-password");

    return { merchant, user: updatedUser };
  }

  // I4: Add staff member to a merchant
  async addStaff(merchantId: string, requesterId: string, staffEmail: string) {
    const merchant = await this.merchantModel.findById(merchantId);
    if (!merchant) throw new NotFoundException("Merchant not found");
    if (merchant.ownerId.toString() !== requesterId.toString()) {
      throw new BadRequestException("Only the merchant owner can manage staff");
    }

    const staffUser = await this.userModel.findOne({ email: staffEmail });
    if (!staffUser)
      throw new NotFoundException("User not found with that email");
    if (staffUser.merchantId) {
      throw new BadRequestException(
        "That user is already linked to another merchant",
      );
    }

    const newRoles = Array.from(new Set([...staffUser.roles, "staff"]));
    const updated = await this.userModel
      .findByIdAndUpdate(
        staffUser._id,
        { roles: newRoles, merchantId },
        { new: true },
      )
      .select("-password");

    return updated;
  }

  // I4: Remove staff member from a merchant
  async removeStaff(
    merchantId: string,
    requesterId: string,
    staffUserId: string,
  ) {
    const merchant = await this.merchantModel.findById(merchantId);
    if (!merchant) throw new NotFoundException("Merchant not found");
    if (merchant.ownerId.toString() !== requesterId.toString()) {
      throw new BadRequestException("Only the merchant owner can manage staff");
    }
    if (staffUserId === requesterId.toString()) {
      throw new BadRequestException("You cannot remove yourself");
    }

    const staffUser = await this.userModel.findById(staffUserId);
    if (!staffUser) throw new NotFoundException("Staff user not found");
    if (staffUser.merchantId?.toString() !== merchantId) {
      throw new BadRequestException("User is not staff at this merchant");
    }

    const newRoles = staffUser.roles.filter((r) => r !== "staff");
    if (newRoles.length === 0) newRoles.push("member");

    const updated = await this.userModel
      .findByIdAndUpdate(
        staffUserId,
        { roles: newRoles, merchantId: null },
        { new: true },
      )
      .select("-password");

    return updated;
  }

  // I4: List staff members for a merchant
  async getStaff(merchantId: string) {
    return this.userModel
      .find({ merchantId })
      .select("-password")
      .sort({ name: 1 });
  }
}
