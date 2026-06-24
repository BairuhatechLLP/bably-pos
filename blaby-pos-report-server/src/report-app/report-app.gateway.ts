import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ReportAppSequelizeService } from './report-app-sequelize.service';

@WebSocketGateway({
  cors: {
    origin: '*', // Configure this based on your frontend URL in production
  },
  namespace: '/live-reports',
})
export class ReportAppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer() server: Server;
  private updateInterval: NodeJS.Timeout;

  constructor(private readonly reportAppService: ReportAppSequelizeService) {}

  afterInit(server: Server) {
    // TEMPORARILY DISABLED for debugging product category creation
    // Send live updates every 10 seconds (adjust as needed)
    // this.updateInterval = setInterval(async () => {
    //   try {
    //     // Fetch latest data from all companies
    //     const homeData = await this.reportAppService.Home1({});
    //     // Broadcast to all connected clients
    //     this.server.emit('liveDataUpdate', homeData);
    //   } catch (error) {
    //     // Error broadcasting - skip
    //   }
    // }, 10000); // Update every 10 seconds
  }

  handleConnection(client: Socket) {
    // TEMPORARILY DISABLED for debugging product category creation
    // Send immediate data on connection
    // this.reportAppService.Home1({}).then((data) => {
    //   client.emit('liveDataUpdate', data);
    // });
  }

  handleDisconnect(client: Socket) {
    // Client disconnected
  }

  // Cleanup on shutdown
  onModuleDestroy() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }
  }
}
