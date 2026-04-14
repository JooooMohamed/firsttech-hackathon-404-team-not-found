import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { createHash } from "crypto";
import { FeatureFlagDocument } from "../../schemas/feature-flag.schema";
import { FlagAssignmentDocument } from "../../schemas/flag-assignment.schema";

@Injectable()
export class FlagsService {
  constructor(
    @InjectModel("FeatureFlag") private flagModel: Model<FeatureFlagDocument>,
    @InjectModel("FlagAssignment") private assignmentModel: Model<FlagAssignmentDocument>,
  ) {}

  // Deterministic hash-based variant assignment
  private hashAssign(userId: string, flagKey: string, variants: any[]): string {
    const hash = createHash("md5").update(`${userId}:${flagKey}`).digest("hex");
    const bucket = parseInt(hash.substring(0, 8), 16) % 100;
    let cumulative = 0;
    for (const v of variants) {
      cumulative += v.weight;
      if (bucket < cumulative) return v.id;
    }
    return variants[variants.length - 1]?.id || "control";
  }

  async getVariant(userId: string, flagKey: string): Promise<string | null> {
    const flag = await this.flagModel.findOne({ key: flagKey });
    if (!flag || !flag.enabled) return null;

    // Check sticky assignment
    const existing = await this.assignmentModel.findOne({
      userId: new Types.ObjectId(userId),
      flagKey,
    });
    if (existing) return existing.variantId;

    // Check target rules
    if (flag.targetRules?.userIds?.length) {
      if (!flag.targetRules.userIds.includes(userId)) return null;
    }

    if (!flag.variants?.length) return "enabled";

    // Assign variant
    const variantId = this.hashAssign(userId, flagKey, flag.variants);
    await this.assignmentModel.findOneAndUpdate(
      { userId: new Types.ObjectId(userId), flagKey },
      { userId: new Types.ObjectId(userId), flagKey, variantId },
      { upsert: true },
    );

    return variantId;
  }

  async isEnabled(userId: string, flagKey: string): Promise<boolean> {
    const variant = await this.getVariant(userId, flagKey);
    return variant !== null;
  }

  async getMyFlags(userId: string) {
    const flags = await this.flagModel.find({ enabled: true });
    const result: Record<string, string | null> = {};
    for (const flag of flags) {
      result[flag.key] = await this.getVariant(userId, flag.key);
    }
    return result;
  }

  // Admin CRUD
  async createFlag(dto: any, createdBy: string) {
    return this.flagModel.create({ ...dto, createdBy: new Types.ObjectId(createdBy) });
  }

  async listFlags() {
    return this.flagModel.find().sort({ createdAt: -1 });
  }

  async updateFlag(key: string, dto: any) {
    return this.flagModel.findOneAndUpdate({ key }, dto, { new: true });
  }

  async deleteFlag(key: string) {
    await this.flagModel.deleteOne({ key });
    await this.assignmentModel.deleteMany({ flagKey: key });
    return { deleted: true };
  }
}
