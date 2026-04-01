import { NestFactory } from "@nestjs/core";
import { ExpressAdapter } from "@nestjs/platform-express";
import express from "express";
import { AppModule } from "./app.module";
import { IncomingMessage, ServerResponse } from "http";

const expressApp = express();
let isReady = false;

async function bootstrap() {
  if (isReady) return;

  const adapter = new ExpressAdapter(expressApp);
  const app = await NestFactory.create(AppModule, adapter);

  app.enableCors({ origin: true, credentials: true });
  app.setGlobalPrefix("api");

  await app.init();
  isReady = true;
}

export default async function handler(
  req: IncomingMessage,
  res: ServerResponse,
) {
  await bootstrap();
  expressApp(req, res);
}
