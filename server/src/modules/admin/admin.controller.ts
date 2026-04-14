import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AuditService } from "../audit/audit.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard, Roles } from "../../common/roles.guard";

@Controller("admin")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("admin")
export class AdminController {
  constructor(
    private adminService: AdminService,
    private auditService: AuditService,
  ) {}

  @Patch("merchants/:id/rates")
  updateMerchantRates(
    @Param("id") id: string,
    @Request() req: any,
    @Body() body: { earnRate?: number; bonusMultiplier?: number; reason?: string },
  ) {
    const { reason, ...updates } = body;
    return this.adminService.updateMerchantRates(id, updates, req.user._id, reason);
  }

  @Patch("programs/:id/rate")
  updateProgramRate(
    @Param("id") id: string,
    @Request() req: any,
    @Body() body: { aedRate: number; reason?: string },
  ) {
    return this.adminService.updateProgramRate(id, body.aedRate, req.user._id, body.reason);
  }

  @Get("audit-logs")
  getAuditLogs(
    @Query("collection") collection?: string,
    @Query("documentId") documentId?: string,
    @Query("limit") limit?: string,
  ) {
    return this.auditService.query({
      collection,
      documentId,
      limit: limit ? parseInt(limit) : undefined,
    });
  }

  @Get("audit-logs/:collection/:documentId")
  getDocumentAuditLogs(
    @Param("collection") collection: string,
    @Param("documentId") documentId: string,
  ) {
    return this.auditService.getByDocument(collection, documentId);
  }
}
