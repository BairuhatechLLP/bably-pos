import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { ReportAppModule } from './report-app/report-app.module';
import { ProductManagementModule } from './product-management/product-management.module';
import { OrderManagementModule } from './order-management/order-management.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AuthModule,
    ReportAppModule,
    ProductManagementModule,
    OrderManagementModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule implements OnModuleInit {
  static async register() {
    const databaseModule = await DatabaseModule.forRoot();

    return {
      module: AppModule,
      imports: [
        ConfigModule.forRoot({
          isGlobal: true,
          envFilePath: '.env',
        }),
        databaseModule,
        AuthModule,
        ReportAppModule,
        ProductManagementModule,
        OrderManagementModule,
      ],
      controllers: [AppController],
      providers: [AppService],
    };
  }

  async onModuleInit() {
    // Server initialization complete
  }
}
