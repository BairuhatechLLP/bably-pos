import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { SubscriptionsProvider } from './subscriptions.provider';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [DatabaseModule,JwtModule],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, ...SubscriptionsProvider],
  exports: [SubscriptionsService],
})
export class SubscriptionsModule {}
