import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { MerchantsController } from "./merchants.controller";
import { MerchantsService } from "./merchants.service";
import { MerchantSchema } from "../../schemas/merchant.schema";
import { UserSchema } from "../../schemas/user.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Merchant", schema: MerchantSchema },
      { name: "User", schema: UserSchema },
    ]),
  ],
  controllers: [MerchantsController],
  providers: [MerchantsService],
  exports: [MerchantsService],
})
export class MerchantsModule {}
