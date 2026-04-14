import { Module, Global } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { FlagsController } from "./flags.controller";
import { FlagsService } from "./flags.service";
import { FeatureFlagSchema } from "../../schemas/feature-flag.schema";
import { FlagAssignmentSchema } from "../../schemas/flag-assignment.schema";

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "FeatureFlag", schema: FeatureFlagSchema },
      { name: "FlagAssignment", schema: FlagAssignmentSchema },
    ]),
  ],
  controllers: [FlagsController],
  providers: [FlagsService],
  exports: [FlagsService],
})
export class FlagsModule {}
