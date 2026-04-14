import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ExchangeController } from "./exchange.controller";
import { ExchangeService } from "./exchange.service";
import { LedgerEntrySchema } from "../../schemas/ledger-entry.schema";
import { ExchangeTransactionSchema } from "../../schemas/exchange-transaction.schema";
import { LinkedProgramSchema } from "../../schemas/linked-program.schema";
import { ProgramCatalogSchema } from "../../schemas/program-catalog.schema";
import { WalletsModule } from "../wallets/wallets.module";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "LedgerEntry", schema: LedgerEntrySchema },
      { name: "ExchangeTransaction", schema: ExchangeTransactionSchema },
      { name: "LinkedProgram", schema: LinkedProgramSchema },
      { name: "ProgramCatalog", schema: ProgramCatalogSchema },
    ]),
    WalletsModule,
  ],
  controllers: [ExchangeController],
  providers: [ExchangeService],
  exports: [ExchangeService],
})
export class ExchangeModule {}
