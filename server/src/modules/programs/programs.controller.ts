import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  Request,
} from "@nestjs/common";
import { ProgramsService } from "./programs.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("programs")
export class ProgramsController {
  constructor(private programsService: ProgramsService) {}

  // Public: Get the full program catalog (names, logos, rates, colors)
  @Get("catalog")
  getCatalog() {
    return this.programsService.getCatalog();
  }

  // Public: Get EasyPoints AED rate
  @Get("easypoints-config")
  getEasyPointsConfig() {
    return this.programsService.getEasyPointsConfig();
  }

  @Get("my")
  @UseGuards(JwtAuthGuard)
  getMyPrograms(@Request() req: any) {
    return this.programsService.getByUserId(req.user._id);
  }

  // Available programs to link
  @Get("available")
  @UseGuards(JwtAuthGuard)
  getAvailable(@Request() req: any) {
    return this.programsService.getAvailable(req.user._id);
  }

  // Link a program (simulated OAuth consent)
  @Post("link")
  @UseGuards(JwtAuthGuard)
  linkProgram(@Request() req: any, @Body() body: { programName: string }) {
    return this.programsService.linkProgram(req.user._id, body.programName);
  }

  // Unlink a program
  @Delete(":id")
  @UseGuards(JwtAuthGuard)
  unlinkProgram(@Request() req: any, @Param("id") id: string) {
    return this.programsService.unlinkProgram(req.user._id, id);
  }
}
