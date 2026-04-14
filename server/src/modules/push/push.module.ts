import { Module, Global } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { PushController } from "./push.controller";
import { PushService } from "./push.service";
import { DeviceTokenSchema } from "../../schemas/device-token.schema";

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([{ name: "DeviceToken", schema: DeviceTokenSchema }]),
  ],
  controllers: [PushController],
  providers: [PushService],
  exports: [PushService],
})
export class PushModule {}
