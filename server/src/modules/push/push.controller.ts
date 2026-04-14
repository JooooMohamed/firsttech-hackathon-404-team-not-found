import { Controller, Post, Delete, Body, UseGuards, Request } from "@nestjs/common";
import { PushService } from "./push.service";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";

@Controller("push")
@UseGuards(JwtAuthGuard)
export class PushController {
  constructor(private pushService: PushService) {}

  @Post("register")
  register(
    @Request() req: any,
    @Body() body: { token: string; platform: "ios" | "android" },
  ) {
    return this.pushService.registerToken(req.user._id, body.token, body.platform);
  }

  @Delete("unregister")
  unregister(@Body() body: { token: string }) {
    return this.pushService.removeToken(body.token);
  }
}
