import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { APP_GUARD } from "@nestjs/core";
import { ConfigModule } from "./config/config.module";
import { ConfigService } from "./config/config.service";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { ProgramsModule } from "./modules/programs/programs.module";
import { MerchantsModule } from "./modules/merchants/merchants.module";
import { WalletsModule } from "./modules/wallets/wallets.module";
import { TransactionsModule } from "./modules/transactions/transactions.module";
import { QrModule } from "./modules/qr/qr.module";
import { SeedModule } from "./modules/seed/seed.module";
import { OffersModule } from "./modules/offers/offers.module";
import { EventsModule } from "./modules/events/events.module";
import { AuditModule } from "./modules/audit/audit.module";
import { AdminModule } from "./modules/admin/admin.module";
import { TiersModule } from "./modules/tiers/tiers.module";
import { ExchangeModule } from "./modules/exchange/exchange.module";
import { CampaignsModule } from "./modules/campaigns/campaigns.module";
import { PushModule } from "./modules/push/push.module";
import { FlagsModule } from "./modules/flags/flags.module";

@Module({
  imports: [
    ConfigModule,
    // Rate limiting: 60 requests per 60 seconds per IP
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.mongoUri,
        retryAttempts: 30,
        retryDelay: 2000,
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    ProgramsModule,
    MerchantsModule,
    WalletsModule,
    TransactionsModule,
    QrModule,
    SeedModule,
    OffersModule,
    EventsModule,
    AuditModule,
    AdminModule,
    TiersModule,
    ExchangeModule,
    CampaignsModule,
    PushModule,
    FlagsModule,
  ],
  providers: [
    // Apply throttling globally
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AppModule {}
