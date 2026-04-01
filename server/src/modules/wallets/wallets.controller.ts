import { Controller, Get, Param, UseGuards, Request } from "@nestjs/common";
import { WalletsService } from "./wallets.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("wallets")
@UseGuards(JwtAuthGuard)
export class WalletsController {
  constructor(private walletsService: WalletsService) {}

  @Get("my")
  getMyWallets(@Request() req: any) {
    return this.walletsService.getWalletsForUser(req.user._id);
  }

  @Get("my/:merchantId")
  getMyMerchantWallet(
    @Request() req: any,
    @Param("merchantId") merchantId: string,
  ) {
    return this.walletsService.getWalletForMerchant(req.user._id, merchantId);
  }
}
