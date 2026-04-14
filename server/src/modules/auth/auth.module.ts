import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";
import { UserSchema } from "../../schemas/user.schema";
import { WalletSchema } from "../../schemas/wallet.schema";
import { MagicLinkSchema } from "../../schemas/magic-link.schema";
import { ConfigModule } from "../../config/config.module";
import { ConfigService } from "../../config/config.service";
import { EmailModule } from "../email/email.module";

@Module({
  imports: [
    PassportModule.register({ defaultStrategy: "jwt" }),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.jwtSecret,
        signOptions: { expiresIn: configService.jwtExpiresIn },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: "User", schema: UserSchema },
      { name: "Wallet", schema: WalletSchema },
      { name: "MagicLink", schema: MagicLinkSchema },
    ]),
    EmailModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [AuthService, JwtStrategy, PassportModule],
})
export class AuthModule {}
