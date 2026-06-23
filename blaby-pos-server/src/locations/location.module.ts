import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { LocationController } from './location.controller';
import { LocationService } from './location.services';
import { locationProvider } from './location.provider';
import { UserSettingsModule } from '../user_settings/user_settings_module';

@Module({
  imports: [DatabaseModule,UserSettingsModule],
  controllers: [LocationController],
  providers: [LocationService, ...locationProvider],
  exports: [LocationService],
})
export class LocationModule {}
