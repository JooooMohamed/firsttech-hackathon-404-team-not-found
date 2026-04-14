import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ExchangeService } from "./exchange.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("exchange")
@UseGuards(JwtAuthGuard)
export class ExchangeController {
  constructor(private exchangeService: ExchangeService) {}

  @Post("quote")
  getQuote(
    @Request() req: any,
    @Body()
    body: {
      sourceProgramId: string;
      targetType: "ep" | "partner";
      targetProgramId?: string;
      amount?: number;
    },
  ) {
    return this.exchangeService.getQuote(
      req.user._id,
      body.sourceProgramId,
      body.targetType,
      body.targetProgramId,
      body.amount,
    );
  }

  @Post("execute")
  execute(
    @Request() req: any,
    @Body()
    body: {
      sourceProgramId: string;
      targetType: "ep" | "partner";
      amount: number;
      targetProgramId?: string;
    },
  ) {
    return this.exchangeService.execute(
      req.user._id,
      body.sourceProgramId,
      body.targetType,
      body.amount,
      body.targetProgramId,
    );
  }

  @Get("history")
  getHistory(@Request() req: any, @Query("limit") limit?: string) {
    return this.exchangeService.getHistory(
      req.user._id,
      limit ? parseInt(limit) : undefined,
    );
  }
}
