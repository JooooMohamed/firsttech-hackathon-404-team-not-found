import { Controller, Post, Body, UsePipes } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { RegisterDto, LoginDto } from "../../dto/auth.dto";
import { JoiValidationPipe } from "../../common/joi-validation.pipe";

@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  @UsePipes(new JoiValidationPipe(RegisterDto))
  register(@Body() body: any) {
    return this.authService.register(body);
  }

  @Post("login")
  @UsePipes(new JoiValidationPipe(LoginDto))
  login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }
}
