import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { LinkedProgramDocument } from "../../schemas/linked-program.schema";
import { ProgramCatalogDocument } from "../../schemas/program-catalog.schema";

@Injectable()
export class ProgramsService {
  constructor(
    @InjectModel("LinkedProgram")
    private linkedProgramModel: Model<LinkedProgramDocument>,
    @InjectModel("ProgramCatalog")
    private catalogModel: Model<ProgramCatalogDocument>,
  ) {}

  // Get the full program catalog from DB
  async getCatalog() {
    return this.catalogModel.find().sort({ name: 1 });
  }

  // Get EasyPoints config (aedRate for EP itself)
  async getEasyPointsConfig() {
    const ep = await this.catalogModel.findOne({ name: "EasyPoints" });
    return {
      aedRate: ep?.aedRate ?? 0.1,
      brandColor: ep?.brandColor ?? "#6C63FF",
    };
  }

  async getByUserId(userId: string) {
    return this.linkedProgramModel.find({ userId });
  }

  // Get available (unlinked) programs for a user
  async getAvailable(userId: string) {
    const [linked, catalog] = await Promise.all([
      this.linkedProgramModel.find({ userId }),
      this.catalogModel.find({ name: { $ne: "EasyPoints" } }),
    ]);
    const linkedNames = linked.map((p) => p.programName);
    return catalog
      .filter((c) => !linkedNames.includes(c.name))
      .map((c) => ({
        programName: c.name,
        programLogo: c.logo,
        currency: c.currency,
        aedRate: c.aedRate,
        brandColor: c.brandColor,
      }));
  }

  // Link a program (simulated OAuth)
  async linkProgram(userId: string, programName: string) {
    const catalog = await this.catalogModel.findOne({ name: programName });
    if (!catalog || programName === "EasyPoints") {
      const all = await this.catalogModel.find({ name: { $ne: "EasyPoints" } });
      throw new BadRequestException(
        `Unknown program: ${programName}. Available: ${all.map((c) => c.name).join(", ")}`,
      );
    }

    const existing = await this.linkedProgramModel.findOne({
      userId,
      programName,
    });
    if (existing) {
      throw new BadRequestException(`${programName} is already linked`);
    }

    // MVP: Simulate external API OAuth response
    // In production, tier and balance come from the partner program's API
    const tier =
      catalog.tiers.length > 0
        ? catalog.tiers[Math.floor(Math.random() * catalog.tiers.length)]
        : "";

    // Simulated balance (no real API integration yet)
    const simulatedBalance = Math.floor(Math.random() * 5000) + 500;

    return this.linkedProgramModel.create({
      userId: new Types.ObjectId(userId),
      programName,
      programLogo: catalog.logo,
      balance: simulatedBalance,
      tier,
      currency: catalog.currency,
      aedRate: catalog.aedRate,
      brandColor: catalog.brandColor,
    });
  }

  // Unlink a program
  async unlinkProgram(userId: string, programId: string) {
    const program = await this.linkedProgramModel.findOneAndDelete({
      _id: programId,
      userId,
    });
    if (!program) throw new NotFoundException("Program not found");
    return { success: true, unlinked: program.programName };
  }
}
