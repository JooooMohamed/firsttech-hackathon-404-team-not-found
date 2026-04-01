import { Injectable, OnModuleInit, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcrypt";
import { UserDocument } from "../../schemas/user.schema";
import { MerchantDocument } from "../../schemas/merchant.schema";
import { WalletDocument } from "../../schemas/wallet.schema";
import { LinkedProgramDocument } from "../../schemas/linked-program.schema";
import { OfferDocument } from "../../schemas/offer.schema";
import { ProgramCatalogDocument } from "../../schemas/program-catalog.schema";

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectModel("User") private userModel: Model<UserDocument>,
    @InjectModel("Merchant") private merchantModel: Model<MerchantDocument>,
    @InjectModel("Wallet") private walletModel: Model<WalletDocument>,
    @InjectModel("LinkedProgram")
    private linkedProgramModel: Model<LinkedProgramDocument>,
    @InjectModel("Offer")
    private offerModel: Model<OfferDocument>,
    @InjectModel("ProgramCatalog")
    private catalogModel: Model<ProgramCatalogDocument>,
  ) {}

  async onModuleInit() {
    const userCount = await this.userModel.countDocuments();
    if (userCount > 0) {
      this.logger.log("Database already seeded, skipping...");
      return;
    }

    this.logger.log("🌱 Seeding database...");
    await this.seed();
    this.logger.log("✅ Database seeded successfully!");
  }

  private async seed() {
    const password = await bcrypt.hash("demo123", 10);

    // ── Users ──────────────────────────────────────────────
    // youssef: pure customer — can only browse merchants, earn & redeem
    const youssef = await this.userModel.create({
      name: "youssef Ahmed",
      email: "youssef@demo.com",
      phone: "+971501234567",
      password,
      roles: ["member"],
      consentGiven: true,
    });

    // Hafez: staff + customer — works at Café Beirut, can also shop
    const merchantOwner = await this.userModel.create({
      name: "Hafez Hassan",
      email: "hafez@demo.com",
      phone: "+971509876543",
      password,
      roles: ["member", "staff"],
      consentGiven: true,
    });

    // Farag: admin + staff + customer — owns / manages all merchants
    const staffUser = await this.userModel.create({
      name: "Farag Ali",
      email: "farag@demo.com",
      phone: "+971505551234",
      password,
      roles: ["member", "staff", "admin"],
      consentGiven: true,
    });

    // ── Merchants ──────────────────────────────────────────
    const cafeBeirut = await this.merchantModel.create({
      name: "Café Beirut",
      logo: "☕",
      category: "Food & Beverage",
      description: "Authentic Lebanese café with the best shawarma in town.",
      earnRate: 10,
      minSpend: 0,
      bonusMultiplier: 1,
      redemptionEnabled: true,
      crossSmeRedemption: true,
      ownerId: merchantOwner._id,
    });

    const bloomFlowers = await this.merchantModel.create({
      name: "Bloom Flowers",
      logo: "🌸",
      category: "Gifts & Flowers",
      description: "Premium flower arrangements and gifts for every occasion.",
      earnRate: 15,
      minSpend: 50,
      bonusMultiplier: 1,
      redemptionEnabled: true,
      crossSmeRedemption: true,
      ownerId: merchantOwner._id,
    });

    const freshMart = await this.merchantModel.create({
      name: "FreshMart",
      logo: "🛒",
      category: "Grocery",
      description: "Your neighborhood grocery store with fresh local produce.",
      earnRate: 5,
      minSpend: 0,
      bonusMultiplier: 2,
      redemptionEnabled: true,
      crossSmeRedemption: false,
      ownerId: merchantOwner._id,
    });

    const fitZone = await this.merchantModel.create({
      name: "FitZone Gym",
      logo: "💪",
      category: "Health & Fitness",
      description:
        "Premium fitness centre with personal trainers and group classes.",
      earnRate: 8,
      minSpend: 0,
      bonusMultiplier: 1,
      redemptionEnabled: true,
      crossSmeRedemption: true,
      ownerId: merchantOwner._id,
    });

    const glamourSalon = await this.merchantModel.create({
      name: "Glamour Salon",
      logo: "💇",
      category: "Beauty & Spa",
      description:
        "Full-service beauty salon offering haircuts, facials, and nail art.",
      earnRate: 12,
      minSpend: 30,
      bonusMultiplier: 1,
      redemptionEnabled: true,
      crossSmeRedemption: true,
      ownerId: merchantOwner._id,
    });

    const wellCarePharmacy = await this.merchantModel.create({
      name: "WellCare Pharmacy",
      logo: "💊",
      category: "Pharmacy",
      description:
        "Trusted neighbourhood pharmacy with prescriptions, supplements and health essentials.",
      earnRate: 3,
      minSpend: 0,
      bonusMultiplier: 1,
      redemptionEnabled: true,
      crossSmeRedemption: true,
      ownerId: merchantOwner._id,
    });

    // Link staff/admin users to Café Beirut (youssef is just a customer, no merchant link)
    await this.userModel.findByIdAndUpdate(merchantOwner._id, {
      merchantId: cafeBeirut._id,
    });
    await this.userModel.findByIdAndUpdate(staffUser._id, {
      merchantId: cafeBeirut._id,
    });

    // ── Wallets ────────────────────────────────────────────
    // youssef: global EP wallet with 500 starting balance
    await this.walletModel.create({
      userId: youssef._id,
      merchantId: null,
      balance: 500,
    });

    // Hafez: global EP wallet
    await this.walletModel.create({
      userId: merchantOwner._id,
      merchantId: null,
      balance: 200,
    });

    // Farag: global EP wallet
    await this.walletModel.create({
      userId: staffUser._id,
      merchantId: null,
      balance: 100,
    });

    // ── Program Catalog (master list — all data from DB) ──
    await this.catalogModel.create([
      {
        name: "EasyPoints",
        logo: "💎",
        currency: "EP",
        tiers: [],
        aedRate: 0.1,
        brandColor: "#6C63FF",
      },
      {
        name: "Share",
        logo: "🟣",
        currency: "Points",
        tiers: ["Blue", "Silver", "Gold"],
        aedRate: 0.01,
        brandColor: "#8B5CF6",
      },
      {
        name: "Etihad Guest",
        logo: "✈️",
        currency: "Miles",
        tiers: ["Bronze", "Silver", "Gold", "Platinum"],
        aedRate: 0.08,
        brandColor: "#D97706",
      },
      {
        name: "Emirates Skywards",
        logo: "🔴",
        currency: "Miles",
        tiers: ["Blue", "Silver", "Gold", "Platinum"],
        aedRate: 0.07,
        brandColor: "#DC2626",
      },
      {
        name: "Aura",
        logo: "🟡",
        currency: "Points",
        tiers: ["Member", "Silver", "Gold"],
        aedRate: 0.01,
        brandColor: "#F59E0B",
      },
      {
        name: "ADNOC Rewards",
        logo: "⛽",
        currency: "Points",
        tiers: ["Classic", "Silver", "Gold", "Platinum"],
        aedRate: 0.01,
        brandColor: "#00843D",
      },
      {
        name: "Smiles",
        logo: "😊",
        currency: "Points",
        tiers: ["Member", "Silver", "Gold"],
        aedRate: 0.005,
        brandColor: "#7B2D8E",
      },
      {
        name: "FAB Rewards",
        logo: "🏦",
        currency: "Points",
        tiers: ["Classic", "Gold", "Platinum"],
        aedRate: 0.02,
        brandColor: "#003087",
      },
      {
        name: "Blue Rewards",
        logo: "💙",
        currency: "Points",
        tiers: ["Blue", "Silver", "Gold"],
        aedRate: 0.01,
        brandColor: "#1E90FF",
      },
    ]);
    this.logger.log(`  Created program catalog (9 entries)`);

    // ── Linked Programs (for youssef) ──────────────────────
    await this.linkedProgramModel.create([
      {
        userId: youssef._id,
        programName: "Share",
        programLogo: "🟣",
        balance: 2450,
        tier: "Gold",
        currency: "Points",
        aedRate: 0.01,
        brandColor: "#8B5CF6",
      },
      {
        userId: youssef._id,
        programName: "Etihad Guest",
        programLogo: "✈️",
        balance: 18300,
        tier: "Silver",
        currency: "Miles",
        aedRate: 0.08,
        brandColor: "#D97706",
      },
      {
        userId: youssef._id,
        programName: "Emirates Skywards",
        programLogo: "🔴",
        balance: 5120,
        tier: "Blue",
        currency: "Miles",
        aedRate: 0.07,
        brandColor: "#DC2626",
      },
      {
        userId: youssef._id,
        programName: "Aura",
        programLogo: "🟡",
        balance: 1800,
        tier: "",
        currency: "Points",
        aedRate: 0.01,
        brandColor: "#F59E0B",
      },
      {
        userId: youssef._id,
        programName: "ADNOC Rewards",
        programLogo: "⛽",
        balance: 1860,
        tier: "Silver",
        currency: "Points",
        aedRate: 0.01,
        brandColor: "#00843D",
      },
      {
        userId: youssef._id,
        programName: "Smiles",
        programLogo: "😊",
        balance: 12300,
        tier: "Gold",
        currency: "Points",
        aedRate: 0.005,
        brandColor: "#7B2D8E",
      },
      {
        userId: youssef._id,
        programName: "FAB Rewards",
        programLogo: "🏦",
        balance: 3100,
        tier: "Gold",
        currency: "Points",
        aedRate: 0.02,
        brandColor: "#003087",
      },
      {
        userId: youssef._id,
        programName: "Blue Rewards",
        programLogo: "💙",
        balance: 5500,
        tier: "Silver",
        currency: "Points",
        aedRate: 0.01,
        brandColor: "#1E90FF",
      },
    ]);

    // Linked programs for Hafez (admin/staff also has some)
    await this.linkedProgramModel.create([
      {
        userId: merchantOwner._id,
        programName: "Share",
        programLogo: "🟣",
        balance: 900,
        tier: "Silver",
        currency: "Points",
        aedRate: 0.01,
        brandColor: "#8B5CF6",
      },
      {
        userId: merchantOwner._id,
        programName: "Etihad Guest",
        programLogo: "✈️",
        balance: 4200,
        tier: "Bronze",
        currency: "Miles",
        aedRate: 0.08,
        brandColor: "#D97706",
      },
    ]);

    // Linked programs for Farag (admin — full set)
    await this.linkedProgramModel.create([
      {
        userId: staffUser._id,
        programName: "Share",
        programLogo: "🟣",
        balance: 3100,
        tier: "Gold",
        currency: "Points",
        aedRate: 0.01,
        brandColor: "#8B5CF6",
      },
      {
        userId: staffUser._id,
        programName: "Etihad Guest",
        programLogo: "✈️",
        balance: 22500,
        tier: "Gold",
        currency: "Miles",
        aedRate: 0.08,
        brandColor: "#D97706",
      },
      {
        userId: staffUser._id,
        programName: "Emirates Skywards",
        programLogo: "🔴",
        balance: 8700,
        tier: "Silver",
        currency: "Miles",
        aedRate: 0.07,
        brandColor: "#DC2626",
      },
      {
        userId: staffUser._id,
        programName: "Aura",
        programLogo: "🟡",
        balance: 1200,
        tier: "",
        currency: "Points",
        aedRate: 0.01,
        brandColor: "#F59E0B",
      },
    ]);

    this.logger.log(`  Created ${3} users`);
    this.logger.log(`  Created ${6} merchants`);
    this.logger.log(`  Created wallets and linked programs`);

    // ── Demo Offers ────────────────────────────────────────
    const now = new Date();
    const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const nextMonth = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await this.offerModel.create([
      {
        merchantId: cafeBeirut._id,
        title: "Double Points Friday!",
        description:
          "Earn 2x EasyPoints on all orders this Friday. Don't miss out!",
        type: "bonus",
        value: 2,
        startsAt: now,
        endsAt: nextWeek,
        isActive: true,
      },
      {
        merchantId: glamourSalon._id,
        title: "50 Bonus EP on Orders Over 100 AED",
        description:
          "Spend 100 AED or more on beauty services and get 50 bonus EasyPoints automatically.",
        type: "bonus",
        value: 50,
        startsAt: now,
        endsAt: nextMonth,
        isActive: true,
      },
      {
        merchantId: freshMart._id,
        title: "Weekend Grocery Deal",
        description: "Get 3x points on all grocery purchases this weekend!",
        type: "bonus",
        value: 3,
        startsAt: now,
        endsAt: nextWeek,
        isActive: true,
      },
      {
        merchantId: cafeBeirut._id,
        title: "Free Coffee at 200 EP",
        description:
          "Redeem just 200 EP for a complimentary Arabic coffee. Limited time offer!",
        type: "freebie",
        value: 200,
        startsAt: now,
        endsAt: nextMonth,
        isActive: true,
      },
      {
        merchantId: fitZone._id,
        title: "New Year Fitness 2x",
        description: "Earn double EasyPoints on every gym visit this month!",
        type: "bonus",
        value: 2,
        startsAt: now,
        endsAt: nextMonth,
        isActive: true,
      },
      {
        merchantId: glamourSalon._id,
        title: "20% Off Facial Treatments",
        description: "Redeem EP and get 20% discount on premium facials.",
        type: "discount",
        value: 20,
        startsAt: now,
        endsAt: nextWeek,
        isActive: true,
      },
      {
        merchantId: wellCarePharmacy._id,
        title: "Free Vitamin Pack at 150 EP",
        description: "Redeem 150 EP for a complimentary daily vitamin pack.",
        type: "freebie",
        value: 150,
        startsAt: now,
        endsAt: nextMonth,
        isActive: true,
      },
    ]);

    this.logger.log(`  Created ${7} demo offers`);
  }
}
