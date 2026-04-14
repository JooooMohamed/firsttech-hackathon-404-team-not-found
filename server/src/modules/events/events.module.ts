import { Module, Global } from "@nestjs/common";
import { EventsGateway } from "./events.gateway";
import { EventsService } from "./events.service";
import { ConfigModule } from "../../config/config.module";

@Global()
@Module({
  imports: [ConfigModule],
  providers: [EventsGateway, EventsService],
  exports: [EventsService],
})
export class EventsModule {}
