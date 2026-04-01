import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ProgramsController } from "./programs.controller";
import { ProgramsService } from "./programs.service";
import { LinkedProgramSchema } from "../../schemas/linked-program.schema";
import { ProgramCatalogSchema } from "../../schemas/program-catalog.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: "LinkedProgram", schema: LinkedProgramSchema },
      { name: "ProgramCatalog", schema: ProgramCatalogSchema },
    ]),
  ],
  controllers: [ProgramsController],
  providers: [ProgramsService],
  exports: [ProgramsService],
})
export class ProgramsModule {}
