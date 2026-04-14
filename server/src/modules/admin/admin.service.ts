import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { MerchantDocument } from "../../schemas/merchant.schema";
import { AuditService } from "../audit/audit.service";

@Injectable()
export class AdminService {
  constructor(
    @InjectModel("Merchant") private merchantModel: Model<MerchantDocument>,
    @InjectModel("ProgramCatalog") private programCatalogModel: Model<any>,
    private auditService: AuditService,
  ) {}

  async updateMerchantRates(
    merchantId: string,
    updates: { earnRate?: number; bonusMultiplier?: number },
    adminUserId: string,
    reason?: string,
  ) {
    const merchant = await this.merchantModel.findById(merchantId);
    if (!merchant) throw new NotFoundException("Merchant not found");

    const changes: Record<string, { old: any; new: any }> = {};
    if (updates.earnRate !== undefined && updates.earnRate !== merchant.earnRate) {
      changes.earnRate = { old: merchant.earnRate, new: updates.earnRate };
    }
    if (updates.bonusMultiplier !== undefined && updates.bonusMultiplier !== merchant.bonusMultiplier) {
      changes.bonusMultiplier = { old: merchant.bonusMultiplier, new: updates.bonusMultiplier };
    }

    if (Object.keys(changes).length === 0) {
      return { merchant, changes: [] };
    }

    const updated = await this.merchantModel.findByIdAndUpdate(
      merchantId,
      updates,
      { new: true },
    );

    await this.auditService.log("merchants", merchantId, changes, adminUserId, reason);

    return { merchant: updated, changes: Object.keys(changes) };
  }

  async updateProgramRate(
    programId: string,
    aedRate: number,
    adminUserId: string,
    reason?: string,
  ) {
    const program = await this.programCatalogModel.findById(programId);
    if (!program) throw new NotFoundException("Program not found");

    const changes: Record<string, { old: any; new: any }> = {};
    if (aedRate !== program.aedRate) {
      changes.aedRate = { old: program.aedRate, new: aedRate };
    }

    if (Object.keys(changes).length === 0) {
      return { program, changes: [] };
    }

    program.aedRate = aedRate;
    await program.save();

    await this.auditService.log("program_catalog", programId, changes, adminUserId, reason);

    return { program, changes: Object.keys(changes) };
  }
}
