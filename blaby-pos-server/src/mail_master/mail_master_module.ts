import { DatabaseModule } from '../database/database.module';
import { Module } from '@nestjs/common';
import { controllerMailMaster } from './mail_master_controller';
import { MailMasterService } from './mail_master_service';
import { MailMasterProviders } from './mail_master_providers';

@Module({
  imports: [DatabaseModule],
  controllers: [controllerMailMaster],
  providers: [MailMasterService, ...MailMasterProviders],
  exports: [],
})
export class MailMasterModule {}
