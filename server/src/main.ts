/* Load .env from server/ directory regardless of cwd */
import * as path from "path";
import * as dotenv from "dotenv";
dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { AppModule } from "./app.module";
import { ConfigService } from "./config/config.service";

async function bootstrap() {
  const logger = new Logger("Bootstrap");
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const allowedOrigins = configService.corsOrigins;

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      // Allow requests with no Origin header (mobile apps, curl, server-to-server)
      if (!origin) return callback(null, true);
      // In dev (no CORS_ORIGINS set), allow everything
      if (allowedOrigins.length === 0) return callback(null, true);
      // Check whitelist
      if (allowedOrigins.includes(origin)) return callback(null, true);
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  });

  app.setGlobalPrefix("api");

  const port = process.env.PORT || 3000;
  // Listen on 0.0.0.0 so the server is reachable from LAN (real devices)
  await app.listen(port, "0.0.0.0");
  logger.log(`EasyPoints API running on http://0.0.0.0:${port}/api`);
  if (allowedOrigins.length > 0) {
    logger.log(`CORS restricted to: ${allowedOrigins.join(", ")}`);
  } else {
    logger.warn("CORS_ORIGINS not set — allowing all origins (dev mode)");
  }
}
bootstrap();
