import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { QrController } from "./qr.controller";
import { QrService } from "./qr.service";
import { QrSessionSchema } from "../../schemas/qr-session.schema";
import { WalletSchema } from "../../schemas/wallet.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "QrSession", schema: QrSessionSchema },
      { name: "Wallet", schema: WalletSchema },
    ]),
  ],
  controllers: [QrController],
  providers: [QrService],
  exports: [QrService],
})
export class QrModule {}
