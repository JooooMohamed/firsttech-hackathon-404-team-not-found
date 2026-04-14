import { Module, Global } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { CampaignsController } from "./campaigns.controller";
import { CampaignsService } from "./campaigns.service";
import { CampaignSchema } from "../../schemas/campaign.schema";

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: "Campaign", schema: CampaignSchema }]),
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {}
