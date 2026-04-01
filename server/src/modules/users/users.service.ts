import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { UserDocument } from "../../schemas/user.schema";

@Injectable()
export class UsersService {
  constructor(@InjectModel("User") private userModel: Model<UserDocument>) {}

  async findById(id: string) {
    return this.userModel.findById(id).select("-password");
  }

  async updateConsent(id: string, consentGiven: boolean) {
    if (!consentGiven) {
      // Revoke consent: anonymize user data (GDPR-like)
      return this.userModel
        .findByIdAndUpdate(
          id,
          {
            consentGiven: false,
            name: "Deleted User",
            phone: "",
          },
          { new: true },
        )
        .select("-password");
    }
    return this.userModel
      .findByIdAndUpdate(id, { consentGiven }, { new: true })
      .select("-password");
  }

  async updateProfile(id: string, data: { name?: string; phone?: string }) {
    return this.userModel
      .findByIdAndUpdate(id, data, { new: true })
      .select("-password");
  }
}
