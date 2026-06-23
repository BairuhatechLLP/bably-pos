import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UserModule } from '../users/user.module';
import { MailModule } from '../mail/mail_module';
import { AccountMasterModule } from '../account_master/account_master_module';
import { ContactMasterModule } from '../contactMaster/contactMasterModule';
import { CompanyMasterModule } from '../company_master/company_master_module';
import { SmsModule } from '../SMS/sms.module';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [DatabaseModule, UserModule, MailModule,AccountMasterModule, ContactMasterModule, CompanyMasterModule,SmsModule,JwtModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
