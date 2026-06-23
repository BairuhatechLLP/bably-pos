import { Module } from '@nestjs/common';
import { ContactusController } from './contactus-controller';
import { ContactusService } from './contactus-service';
import { contactusProviders } from './contactus-provider';
import { MailModule } from '../mail/mail_module';

@Module({
  imports: [MailModule],
  controllers: [ContactusController],
  providers: [ContactusService, ...contactusProviders],
  exports: [],
})
export class ContactusModule {}
