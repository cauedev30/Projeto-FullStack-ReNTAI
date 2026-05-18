import { JwtService } from "@nestjs/jwt";
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { PrismaService } from "../database/prisma.service";

@WebSocketGateway({
  cors: {
    origin: process.env.WEB_ORIGIN ?? "http://localhost:3000",
    credentials: true
  }
})
export class TeleconsultationsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server!: Server;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService
  ) {}

  async handleConnection(socket: Socket) {
    const token = socket.handshake.auth?.token;
    if (!token || typeof token !== "string") {
      socket.disconnect(true);
      return;
    }

    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(token);
      const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
      if (!user) {
        socket.disconnect(true);
        return;
      }

      await socket.join(`user:${user.id}`);
      socket.data.userId = user.id;
    } catch {
      socket.disconnect(true);
    }
  }

  @SubscribeMessage("ping")
  ping(@MessageBody() body: unknown, @ConnectedSocket() socket: Socket) {
    socket.emit("pong", body ?? { ok: true });
  }

  notifyOpinionRegistered(solicitantId: string, payload: unknown) {
    this.server.to(`user:${solicitantId}`).emit("opinion.registered", payload);
  }
}
