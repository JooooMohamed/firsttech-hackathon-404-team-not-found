import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { SeedService } from "./seed.service";
import { UserSchema } from "../../schemas/user.schema";
import { MerchantSchema } from "../../schemas/merchant.schema";
import { WalletSchema } from "../../schemas/wallet.schema";
import { LinkedProgramSchema } from "../../schemas/linked-program.schema";
import { OfferSchema } from "../../schemas/offer.schema";
import { ProgramCatalogSchema } from "../../schemas/program-catalog.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "User", schema: UserSchema },
      { name: "Merchant", schema: MerchantSchema },
      { name: "Wallet", schema: WalletSchema },
      { name: "LinkedProgram", schema: LinkedProgramSchema },
      { name: "Offer", schema: OfferSchema },
      { name: "ProgramCatalog", schema: ProgramCatalogSchema },
    ]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
