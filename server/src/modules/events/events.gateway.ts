import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from "@nestjs/websockets";
import { Logger } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import * as jwt from "jsonwebtoken";
import { ConfigService } from "../../config/config.service";

@WebSocketGateway({
  namespace: "/events",
  cors: { origin: true, credentials: true },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer() server: Server;
  private readonly logger = new Logger(EventsGateway.name);

  constructor(private configService: ConfigService) {}

  handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace("Bearer ", "");

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = jwt.verify(token, this.configService.jwtSecret) as any;
      const userId = payload.sub;
      const merchantId = payload.merchantId;

      // Join user-specific room
      client.join(`user:${userId}`);
      if (merchantId) {
        client.join(`merchant:${merchantId}`);
      }

      client.data.userId = userId;
      this.logger.log(`Client connected: user:${userId}`);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    if (client.data.userId) {
      this.logger.log(`Client disconnected: user:${client.data.userId}`);
    }
  }
}
