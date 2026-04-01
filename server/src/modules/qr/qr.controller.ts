import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  Request,
  UsePipes,
} from "@nestjs/common";
import { QrService } from "./qr.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { CreateQrSessionDto } from "../../dto/qr.dto";
import { JoiValidationPipe } from "../../common/joi-validation.pipe";

@Controller("qr")
@UseGuards(JwtAuthGuard)
export class QrController {
  constructor(private qrService: QrService) {}

  @Post("create")
  @UsePipes(new JoiValidationPipe(CreateQrSessionDto))
  createSession(@Request() req: any, @Body() body: any) {
    return this.qrService.createSession(req.user._id, body);
  }

  @Get(":token")
  lookupSession(@Param("token") token: string) {
    return this.qrService.lookupSession(token);
  }

  @Patch(":token/complete")
  completeSession(@Param("token") token: string) {
    return this.qrService.completeSession(token);
  }
}
