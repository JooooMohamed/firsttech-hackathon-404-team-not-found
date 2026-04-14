import {
  Controller, Get, Post, Patch, Delete,
  Param, Body, UseGuards, Request,
} from "@nestjs/common";
import { FlagsService } from "./flags.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { RolesGuard, Roles } from "../../common/roles.guard";

@Controller("flags")
export class FlagsController {
  constructor(private flagsService: FlagsService) {}

  @Get("my")
  @UseGuards(JwtAuthGuard)
  getMyFlags(@Request() req: any) {
    return this.flagsService.getMyFlags(req.user._id);
  }

  // Admin endpoints
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  create(@Request() req: any, @Body() body: any) {
    return this.flagsService.createFlag(body, req.user._id);
  }

  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  list() {
    return this.flagsService.listFlags();
  }

  @Patch(":key")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  update(@Param("key") key: string, @Body() body: any) {
    return this.flagsService.updateFlag(key, body);
  }

  @Delete(":key")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("admin")
  delete(@Param("key") key: string) {
    return this.flagsService.deleteFlag(key);
  }
}
