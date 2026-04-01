import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  Request,
  UsePipes,
  Query,
  Header,
} from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { EarnDto, RedeemDto } from "../../dto/transaction.dto";
import { JoiValidationPipe } from "../../common/joi-validation.pipe";
import { RolesGuard, Roles } from "../../common/roles.guard";

@Controller("transactions")
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Post("earn")
  @Roles("staff", "admin")
  @UsePipes(new JoiValidationPipe(EarnDto))
  earn(@Request() req: any, @Body() body: any) {
    return this.transactionsService.earn({ ...body, staffId: req.user._id });
  }

  @Post("redeem")
  @Roles("staff", "admin")
  @UsePipes(new JoiValidationPipe(RedeemDto))
  redeem(@Request() req: any, @Body() body: any) {
    return this.transactionsService.redeem({ ...body, staffId: req.user._id });
  }

  // ── my/* specific routes MUST come before the general "my" route ──
  @Get("my/export/csv")
  @Header("Content-Type", "text/csv")
  @Header("Content-Disposition", "attachment; filename=my-transactions.csv")
  async exportMyCsv(@Request() req: any) {
    return this.transactionsService.exportUserCsv(req.user._id);
  }

  @Get("my/insights")
  getMyInsights(@Request() req: any) {
    return this.transactionsService.getUserInsights(req.user._id);
  }

  @Get("my")
  getMyTransactions(
    @Request() req: any,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return this.transactionsService.getByUserId(
      req.user._id,
      parseInt(page || "1", 10),
      parseInt(limit || "50", 10),
      startDate,
      endDate,
    );
  }

  // ── merchant/:id specific routes before general merchant/:id ──
  @Get("merchant/:id/export/csv")
  @Roles("staff", "admin")
  @Header("Content-Type", "text/csv")
  @Header("Content-Disposition", "attachment; filename=transactions.csv")
  async exportMerchantCsv(@Param("id") id: string) {
    return this.transactionsService.exportMerchantCsv(id);
  }

  @Get("merchant/:id/stats/daily")
  @Roles("staff", "admin")
  getDailyStats(@Param("id") id: string) {
    return this.transactionsService.getDailyStats(id);
  }

  @Get("merchant/:id/stats")
  @Roles("staff", "admin")
  getMerchantStats(@Param("id") id: string) {
    return this.transactionsService.getMerchantStats(id);
  }

  @Get("merchant/:id")
  @Roles("staff", "admin")
  getMerchantTransactions(
    @Param("id") id: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
  ) {
    return this.transactionsService.getByMerchantId(
      id,
      parseInt(page || "1", 10),
      parseInt(limit || "50", 10),
    );
  }
}
