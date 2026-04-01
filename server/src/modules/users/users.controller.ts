import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  Request,
  UsePipes,
} from "@nestjs/common";
import { UsersService } from "./users.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ConsentDto } from "../../dto/auth.dto";
import { UpdateProfileDto } from "../../dto/user.dto";
import { JoiValidationPipe } from "../../common/joi-validation.pipe";

@Controller("users")
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get("me")
  getMe(@Request() req: any) {
    return this.usersService.findById(req.user._id);
  }

  @Patch("me/consent")
  @UsePipes(new JoiValidationPipe(ConsentDto))
  updateConsent(@Request() req: any, @Body() body: { consentGiven: boolean }) {
    return this.usersService.updateConsent(req.user._id, body.consentGiven);
  }

  @Patch("me")
  @UsePipes(new JoiValidationPipe(UpdateProfileDto))
  updateProfile(
    @Request() req: any,
    @Body() body: { name?: string; phone?: string },
  ) {
    return this.usersService.updateProfile(req.user._id, body);
  }
}
