import { Module } from '@nestjs/common';
import { ReportAppController } from './report-app.controller';
import { ReportAppService } from './report-app.service';
import { ReportAppGateway } from './report-app.gateway';
import { ReportAppSequelizeService } from './report-app-sequelize.service';
import { ReportAppMultiDbController } from './report-app-multi-db.controller';

@Module({
  controllers: [
    // ReportAppController, // Disabled - Using Sequelize controller instead
    ReportAppMultiDbController, // Multi-database Sequelize controller
  ],
  providers: [
    // ReportAppService, // Disabled - Using Sequelize service instead
    ReportAppGateway, // WebSocket gateway
    ReportAppSequelizeService, // Multi-database Sequelize service
  ],
  exports: [ReportAppSequelizeService],
})
export class ReportAppModule {}
