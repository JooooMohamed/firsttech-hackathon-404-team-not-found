import { Module, Global } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TiersController } from "./tiers.controller";
import { TiersService } from "./tiers.service";
import { TierConfigSchema } from "../../schemas/tier-config.schema";
import { UserSchema } from "../../schemas/user.schema";

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "TierConfig", schema: TierConfigSchema },
      { name: "User", schema: UserSchema },
    ]),
  ],
  controllers: [TiersController],
  providers: [TiersService],
  exports: [TiersService],
})
export class TiersModule {}
