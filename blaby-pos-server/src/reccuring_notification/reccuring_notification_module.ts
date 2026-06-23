import { Module, forwardRef } from '@nestjs/common';
import { ReccuringNotificationService } from './reccuring_notification_service';
import { DatabaseModule } from '../database/database.module';
import { ReccuringNotificationController } from './reccuring_notification_controller';
import { ReccuringNotificationProvider } from './reccuring_notfication_provider';
import { SalesInvoicesModule } from '../sale_invoice/sale_invoice_module';
import { UserSettingsModule } from '../user_settings/user_settings_module';
import { MailModule } from '../mail/mail_module';
import { UserModule } from '../users/user.module';
import { HttpModule } from '@nestjs/axios'

@Module({
  imports: [
    DatabaseModule,
    MailModule,
    UserSettingsModule,
    HttpModule,
    forwardRef(()=>UserModule),
    forwardRef(() => SalesInvoicesModule),
  ],
  controllers: [ReccuringNotificationController],
  providers: [ReccuringNotificationService, ...ReccuringNotificationProvider],
  exports: [ReccuringNotificationService],
})
export class ReccuringNotificationModule {}
