import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { MerchantSchema } from "../../schemas/merchant.schema";
import { ProgramCatalogSchema } from "../../schemas/program-catalog.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "Merchant", schema: MerchantSchema },
      { name: "ProgramCatalog", schema: ProgramCatalogSchema },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
