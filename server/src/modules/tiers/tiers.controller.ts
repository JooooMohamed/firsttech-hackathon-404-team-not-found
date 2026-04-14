import { Controller, Get, UseGuards, Request } from "@nestjs/common";
import { TiersService } from "./tiers.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("tiers")
export class TiersController {
  constructor(private tiersService: TiersService) {}

  @Get()
  getTierConfig() {
    return this.tiersService.getTierConfig();
  }

  @Get("my")
  @UseGuards(JwtAuthGuard)
  getMyTier(@Request() req: any) {
    return this.tiersService.getUserTierInfo(req.user._id);
  }
}
