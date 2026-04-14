import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { randomBytes } from "crypto";
import { UserDocument } from "../../schemas/user.schema";
import { WalletDocument } from "../../schemas/wallet.schema";
import { MagicLinkDocument } from "../../schemas/magic-link.schema";
import { EmailService } from "../email/email.service";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel("User") private userModel: Model<UserDocument>,
    @InjectModel("Wallet") private walletModel: Model<WalletDocument>,
    @InjectModel("MagicLink") private magicLinkModel: Model<MagicLinkDocument>,
    private jwtService: JwtService,
    private emailService: EmailService,
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

  // ── Magic Link Auth ──────────────────────────────────

  async requestMagicLink(email: string) {
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Invalidate any existing tokens for this email
    await this.magicLinkModel.updateMany(
      { email, used: false },
      { used: true },
    );

    await this.magicLinkModel.create({ email, token, expiresAt });
    await this.emailService.sendMagicLink(email, token);

    return { message: "Check your email for a sign-in link" };
  }

  async verifyMagicLink(token: string) {
    const link = await this.magicLinkModel.findOne({ token, used: false });
    if (!link) throw new BadRequestException("Invalid or expired magic link");
    if (link.expiresAt < new Date()) {
      throw new BadRequestException("Magic link expired");
    }

    // Mark as used
    link.used = true;
    await link.save();

    // Find or create user
    let user = await this.userModel.findOne({ email: link.email });
    if (!user) {
      // Auto-register new user from magic link
      const generateCode = () => {
        const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
        let code = "";
        for (let i = 0; i < 6; i++) {
          code += chars[Math.floor(Math.random() * chars.length)];
        }
        return code;
      };
      let referralCode = generateCode();
      while (await this.userModel.findOne({ referralCode })) {
        referralCode = generateCode();
      }

      user = await this.userModel.create({
        name: link.email.split("@")[0],
        email: link.email,
        phone: "",
        password: await bcrypt.hash(randomBytes(32).toString("hex"), 10),
        roles: ["member"],
        merchantId: null,
        referralCode,
      });

      await this.walletModel.create({
        userId: user._id,
        merchantId: null,
        balance: 0,
      });
    }

    const jwtToken = this.jwtService.sign({
      sub: user._id,
      email: user.email,
      roles: user.roles,
    });

    return { token: jwtToken, user: this.sanitizeUser(user) };
  }
}
