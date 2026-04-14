import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards, Request,
} from "@nestjs/common";
import { CampaignsService } from "./campaigns.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard, Roles } from "../../common/roles.guard";

@Controller("campaigns")
export class CampaignsController {
  constructor(private campaignsService: CampaignsService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("staff", "admin")
  create(@Request() req: any, @Body() body: any) {
    return this.campaignsService.create(body, req.user._id);
  }

  @Get("active")
  findActive() {
    return this.campaignsService.findActive();
  }

  @Get("merchant/:id")
  findByMerchant(@Param("id") id: string) {
    return this.campaignsService.findByMerchant(id);
  }

  @Patch(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("staff", "admin")
  update(@Param("id") id: string, @Body() body: any) {
    return this.campaignsService.update(id, body);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  delete(@Param("id") id: string) {
    return this.campaignsService.delete(id);
  }
}
