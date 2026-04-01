import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { UserDocument } from "../../schemas/user.schema";
import { WalletDocument } from "../../schemas/wallet.schema";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel("User") private userModel: Model<UserDocument>,
    @InjectModel("Wallet") private walletModel: Model<WalletDocument>,
    private jwtService: JwtService,
  ) {}

  async register(dto: {
    name: string;
    email: string;
    phone?: string;
    password: string;
    roles?: string[];
    merchantId?: string;
    referralCode?: string;
  }) {
    const existing = await this.userModel.findOne({ email: dto.email });
    if (existing) {
      throw new ConflictException("Email already registered");
    }

    // Generate unique 6-char referral code for the new user
    const generateCode = () => {
      const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      let code = "";
      for (let i = 0; i < 6; i++) {
        code += chars[Math.floor(Math.random() * chars.length)];
      }
      return code;
    };
    let newReferralCode = generateCode();
    // Ensure uniqueness
    while (await this.userModel.findOne({ referralCode: newReferralCode })) {
      newReferralCode = generateCode();
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    // Security: force member role on self-registration — admins are created via seed/DB only
    const user = await this.userModel.create({
      name: dto.name,
      email: dto.email,
      phone: dto.phone || "",
      password: hashed,
      roles: ["member"],
      merchantId: null,
      referralCode: newReferralCode,
    });

    // Create global EasyPoints wallet for new user
    await this.walletModel.create({
      userId: user._id,
      merchantId: null,
      balance: 0,
    });

    // Credit referrer with 5 EP if a valid referral code was provided
    if (dto.referralCode) {
      const referrer = await this.userModel.findOne({
        referralCode: dto.referralCode.toUpperCase(),
      });
      if (referrer) {
        await this.walletModel.findOneAndUpdate(
          { userId: referrer._id, merchantId: null },
          { $inc: { balance: 5 } },
        );
      }
    }

    const token = this.jwtService.sign({
      sub: user._id,
      email: user.email,
      roles: user.roles,
    });

    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  async login(email: string, password: string) {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const token = this.jwtService.sign({
      sub: user._id,
      email: user.email,
      roles: user.roles,
    });

    return {
      token,
      user: this.sanitizeUser(user),
    };
  }

  private sanitizeUser(user: UserDocument) {
    const obj = user.toObject();
    delete obj.password;
    return obj;
  }
}
