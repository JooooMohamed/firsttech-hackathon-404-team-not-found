/* Load .env from server/ directory regardless of cwd */
import * as path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create(AppModule);

  // Allow CORS from any origin (mobile app + dev tools)
  app.enableCors({ origin: true, credentials: true });

  app.setGlobalPrefix("api");

  const port = process.env.PORT || 3000;
  // Listen on 0.0.0.0 so the server is reachable from LAN (real devices)
  await app.listen(port, "0.0.0.0");
  logger.log(`EasyPoints API running on http://0.0.0.0:${port}/api`);
}
bootstrap();
