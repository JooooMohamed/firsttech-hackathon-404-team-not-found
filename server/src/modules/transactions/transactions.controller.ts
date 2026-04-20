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
import { Throttle } from "@nestjs/throttler";
import { TransactionsService } from "./transactions.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import {
  EarnDto,
  RedeemDto,
  VoidTransactionDto,
} from "../../dto/transaction.dto";
import { JoiValidationPipe } from "../../common/joi-validation.pipe";
import { RolesGuard, Roles } from "../../common/roles.guard";
import { MerchantOwnershipGuard } from "../../common/merchant-ownership.guard";
import {
  EarnBody,
  RedeemBody,
  TransactionQueryParams,
  MerchantQueryParams,
} from "./transactions.types";

@Controller("transactions")
@UseGuards(JwtAuthGuard, RolesGuard)
export class TransactionsController {
  constructor(private transactionsService: TransactionsService) {}

  @Post("earn")
  @Roles("staff", "admin")
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @UsePipes(new JoiValidationPipe(EarnDto))
  earn(@Request() req: any, @Body() body: EarnBody) {
    return this.transactionsService.earn({ ...body, staffId: req.user._id });
  }

  @Post("redeem")
  @Roles("staff", "admin")
  @Throttle({ default: { ttl: 60000, limit: 10 } })
  @UsePipes(new JoiValidationPipe(RedeemDto))
  redeem(@Request() req: any, @Body() body: RedeemBody) {
    return this.transactionsService.redeem({ ...body, staffId: req.user._id });
  }

  @Post(":id/void")
  @Roles("admin")
  @UsePipes(new JoiValidationPipe(VoidTransactionDto))
  voidTransaction(
    @Param("id") id: string,
    @Request() req: any,
    @Body() body: { reason?: string },
  ) {
    return this.transactionsService.voidTransaction(
      id,
      req.user._id,
      body.reason,
    );
  }

  // ── my/* specific routes MUST come before the general "my" route ──
  @Get("my/export/csv")
  @Header("Content-Type", "text/csv")
  @Header("Content-Disposition", "attachment; filename=my-transactions.csv")
  async exportMyCsv(
    @Request() req: any,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return this.transactionsService.exportUserCsv(req.user._id, {
      startDate,
      endDate,
    });
  }

  @Get("my/insights")
  getMyInsights(@Request() req: any) {
    return this.transactionsService.getUserInsights(req.user._id);
  }

  @Get("my")
  getMyTransactions(
    @Request() req: any,
    @Query("cursor") cursor?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return this.transactionsService.getByUserId(req.user._id, {
      cursor,
      limit: this.clampLimit(limit),
      page: page ? parseInt(page, 10) : undefined,
      startDate,
      endDate,
    });
  }

  // ── merchant/:id specific routes before general merchant/:id ──
  @Get("merchant/:id/export/csv")
  @Roles("staff", "admin")
  @UseGuards(MerchantOwnershipGuard)
  @Header("Content-Type", "text/csv")
  @Header("Content-Disposition", "attachment; filename=transactions.csv")
  async exportMerchantCsv(
    @Param("id") id: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return this.transactionsService.exportMerchantCsv(id, {
      startDate,
      endDate,
    });
  }

  @Get("merchant/:id/stats/daily")
  @Roles("staff", "admin")
  @UseGuards(MerchantOwnershipGuard)
  getDailyStats(@Param("id") id: string) {
    return this.transactionsService.getDailyStats(id);
  }

  @Get("merchant/:id/stats")
  @Roles("staff", "admin")
  @UseGuards(MerchantOwnershipGuard)
  getMerchantStats(@Param("id") id: string) {
    return this.transactionsService.getMerchantStats(id);
  }

  @Get("merchant/:id")
  @Roles("staff", "admin")
  @UseGuards(MerchantOwnershipGuard)
  getMerchantTransactions(
    @Param("id") id: string,
    @Query("cursor") cursor?: string,
    @Query("page") page?: string,
    @Query("limit") limit?: string,
    @Query("startDate") startDate?: string,
    @Query("endDate") endDate?: string,
  ) {
    return this.transactionsService.getByMerchantId(id, {
      cursor,
      limit: this.clampLimit(limit),
      page: page ? parseInt(page, 10) : undefined,
      startDate,
      endDate,
    });
  }

  private clampLimit(raw?: string): number {
    const n = parseInt(raw || "20", 10);
    return Math.min(Math.max(Number.isNaN(n) ? 20 : n, 1), 100);
  }
}
