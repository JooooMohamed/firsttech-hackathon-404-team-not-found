import { Injectable, Logger } from "@nestjs/common";
import { EventsGateway } from "./events.gateway";

export const EVENTS = {
  TRANSACTION_COMPLETED: "transaction:completed",
  BALANCE_UPDATED: "balance:updated",
  OFFER_ACTIVATED: "offer:activated",
  TIER_UPGRADED: "tier:upgraded",
} as const;

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);

  constructor(private gateway: EventsGateway) {}

  emitToUser(userId: string, event: string, data: any) {
    try {
      this.gateway.server?.to(`user:${userId}`).emit(event, data);
    } catch (err) {
      this.logger.warn(`Failed to emit ${event} to user:${userId}`);
    }
  }

  emitToMerchant(merchantId: string, event: string, data: any) {
    try {
      this.gateway.server?.to(`merchant:${merchantId}`).emit(event, data);
    } catch (err) {
      this.logger.warn(`Failed to emit ${event} to merchant:${merchantId}`);
    }
  }
}
