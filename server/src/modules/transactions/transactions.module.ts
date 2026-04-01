import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { TransactionsController } from "./transactions.controller";
import { TransactionsService } from "./transactions.service";
import { TransactionSchema } from "../../schemas/transaction.schema";
import { QrSessionSchema } from "../../schemas/qr-session.schema";
import { OfferSchema } from "../../schemas/offer.schema";
import { WalletsModule } from "../wallets/wallets.module";
import { MerchantsModule } from "../merchants/merchants.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Transaction", schema: TransactionSchema },
      { name: "QrSession", schema: QrSessionSchema },
      { name: "Offer", schema: OfferSchema },
    ]),
    WalletsModule,
    MerchantsModule,
  ],
  controllers: [TransactionsController],
  providers: [TransactionsService],
  exports: [TransactionsService],
})
export class TransactionsModule {}
