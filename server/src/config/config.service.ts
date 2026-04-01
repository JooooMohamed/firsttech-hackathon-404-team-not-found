import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);

  constructor() {
    this.validateEnv();
  }

  private validateEnv(): void {
    if (!process.env.JWT_SECRET) {
      this.logger.warn(
        "JWT_SECRET not set — using default. Set it in .env for production!",
      );
    }
    if (!process.env.MONGODB_URI) {
      this.logger.warn(
        "MONGODB_URI not set — using default localhost connection.",
      );
    }
  }

  get mongoUri(): string {
    if (!process.env.MONGODB_URI) {
      throw new Error(
        "MONGODB_URI environment variable is required! " +
          "Set it in server/.env to your MongoDB Atlas connection string. " +
          "NEVER use a local MongoDB instance.",
      );
    }
    return process.env.MONGODB_URI;
  }

  get jwtSecret(): string {
    return process.env.JWT_SECRET || "easypoints-hackathon-secret-2026";
  }

  get jwtExpiresIn(): string {
    return process.env.JWT_EXPIRES_IN || "7d";
  }

  get port(): number {
    return parseInt(process.env.PORT || "3000", 10);
  }
}
