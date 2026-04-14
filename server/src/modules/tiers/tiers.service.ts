import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { TierConfigDocument } from "../../schemas/tier-config.schema";
import { UserDocument } from "../../schemas/user.schema";
import { EventsService, EVENTS } from "../events/events.service";

@Injectable()
export class TiersService {
  private readonly logger = new Logger(TiersService.name);
  private tierCache: TierConfigDocument[] = [];

  constructor(
    @InjectModel("TierConfig") private tierConfigModel: Model<TierConfigDocument>,
    @InjectModel("User") private userModel: Model<UserDocument>,
    private eventsService: EventsService,
  ) {
    this.loadTiers();
  }

  private async loadTiers() {
    this.tierCache = await this.tierConfigModel.find().sort({ minLifetimeEP: 1 });
    if (this.tierCache.length === 0) {
      await this.seedDefaultTiers();
      this.tierCache = await this.tierConfigModel.find().sort({ minLifetimeEP: 1 });
    }
  }

  private async seedDefaultTiers() {
    const defaults = [
      { name: "Bronze", minLifetimeEP: 0, earnMultiplier: 1, perks: ["Standard benefits"], badgeEmoji: "🥉", sortOrder: 0 },
      { name: "Silver", minLifetimeEP: 5000, earnMultiplier: 1.1, perks: ["Priority offers", "Early access"], badgeEmoji: "🥈", sortOrder: 1 },
      { name: "Gold", minLifetimeEP: 25000, earnMultiplier: 1.25, perks: ["Dedicated support", "Exclusive deals", "Priority offers"], badgeEmoji: "🥇", sortOrder: 2 },
      { name: "Platinum", minLifetimeEP: 100000, earnMultiplier: 1.5, perks: ["Concierge", "VIP events", "White-glove service", "All Gold perks"], badgeEmoji: "💎", sortOrder: 3 },
    ];
    await this.tierConfigModel.insertMany(defaults);
    this.logger.log("Seeded default tier configs");
  }

  async getTierConfig() {
    if (this.tierCache.length === 0) await this.loadTiers();
    return this.tierCache;
  }

  calculateTier(lifetimeEP: number): { name: string; earnMultiplier: number; badgeEmoji: string } {
    const tiers = this.tierCache;
    let current = tiers[0];
    for (const tier of tiers) {
      if (lifetimeEP >= tier.minLifetimeEP) {
        current = tier;
      }
    }
    return {
      name: current?.name || "Bronze",
      earnMultiplier: current?.earnMultiplier || 1,
      badgeEmoji: current?.badgeEmoji || "🥉",
    };
  }

  getTierMultiplier(lifetimeEP: number): number {
    return this.calculateTier(lifetimeEP).earnMultiplier;
  }

  async checkAndUpgradeTier(userId: string): Promise<{ upgraded: boolean; newTier?: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) return { upgraded: false };

    const { name: newTier, badgeEmoji } = this.calculateTier(user.lifetimeEP || 0);
    const currentTier = user.tier || "Bronze";

    if (newTier !== currentTier) {
      await this.userModel.findByIdAndUpdate(userId, { tier: newTier });
      this.eventsService.emitToUser(userId, EVENTS.TIER_UPGRADED, {
        previousTier: currentTier,
        newTier,
        badgeEmoji,
        lifetimeEP: user.lifetimeEP,
      });
      this.logger.log(`User ${userId} upgraded: ${currentTier} → ${newTier}`);
      return { upgraded: true, newTier };
    }

    return { upgraded: false };
  }

  async getUserTierInfo(userId: string) {
    const user = await this.userModel.findById(userId).select("tier lifetimeEP");
    if (!user) return null;

    const tiers = await this.getTierConfig();
    const currentTier = tiers.find((t) => t.name === (user.tier || "Bronze"));
    const currentIndex = tiers.findIndex((t) => t.name === (user.tier || "Bronze"));
    const nextTier = currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;

    return {
      currentTier: {
        name: currentTier?.name || "Bronze",
        earnMultiplier: currentTier?.earnMultiplier || 1,
        perks: currentTier?.perks || [],
        badgeEmoji: currentTier?.badgeEmoji || "🥉",
      },
      lifetimeEP: user.lifetimeEP || 0,
      nextTier: nextTier
        ? {
            name: nextTier.name,
            minLifetimeEP: nextTier.minLifetimeEP,
            pointsNeeded: nextTier.minLifetimeEP - (user.lifetimeEP || 0),
            earnMultiplier: nextTier.earnMultiplier,
            badgeEmoji: nextTier.badgeEmoji,
          }
        : null,
      progress: nextTier
        ? Math.min(((user.lifetimeEP || 0) / nextTier.minLifetimeEP) * 100, 100)
        : 100,
    };
  }
}
