import { DatabaseModule } from '../database/database.module';
import { Module, forwardRef } from '@nestjs/common';
import { UserSettingsController } from './user_settings_controller';
import { UserSettingsService } from './user_settings_service';
import { UserSettingsProviders } from './user_settings_providers';
import { UserModule } from '../users/user.module';
import { InvoiceNoModule } from '../invoiceno/invoiceno.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => UserModule), InvoiceNoModule],
  controllers: [UserSettingsController],
  providers: [UserSettingsService, ...UserSettingsProviders],
  exports: [UserSettingsService],
})
export class UserSettingsModule {}
