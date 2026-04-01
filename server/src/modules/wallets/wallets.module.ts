import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { WalletsController } from "./wallets.controller";
import { WalletsService } from "./wallets.service";
import { WalletSchema } from "../../schemas/wallet.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Wallet", schema: WalletSchema }]),
  ],
  controllers: [WalletsController],
  providers: [WalletsService],
  exports: [WalletsService],
})
export class WalletsModule {}
