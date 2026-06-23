import { Module } from '@nestjs/common';
import { JwtStrategy } from './otpStratergy/jwt-stratergy';
import { SmsController } from './sms.controller';
import { smsProviders } from './sms.providers';
import { SmsService } from './sms.service';
import { UserModule } from '../users/user.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule ,UserModule],
  controllers: [SmsController],
  providers: [SmsService,...smsProviders, JwtStrategy],
  exports: [SmsService],
})
export class SmsModule {}
