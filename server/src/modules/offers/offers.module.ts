import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OffersController } from "./offers.controller";
import { OffersService } from "./offers.service";
import { OfferSchema } from "../../schemas/offer.schema";

@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Offer", schema: OfferSchema }]),
  ],
  controllers: [OffersController],
  providers: [OffersService],
  exports: [OffersService],
})
export class OffersModule {}
