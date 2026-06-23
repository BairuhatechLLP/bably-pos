import { Body, Controller, Post, UseInterceptors } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RequestOtpDto } from './dto/requestOtp.dto';
import { verifyOtpDto } from './dto/sms.dto';
import { SmsService } from './sms.service';
import { UserId } from '../shared/decorators/userId_decorator';
import { Public } from '../shared/decorators/public.decorator';
import { ErrorsInterceptor } from '../shared/interceptor/error.interceptor';

@ApiTags("sms")
@Controller('sms')
@UseInterceptors(ErrorsInterceptor)
export class SmsController {
  constructor(private readonly smsService: SmsService) {}

  @Post('request-otp')
  @Public()
  async requestOTP(
    @Body() userData: RequestOtpDto,
  ): Promise<any> {
    return await this.smsService.requestOTP(userData);
  }

  @Post('verify-otp')
  @Public()
  async verifyOTP(
    @Body() token: verifyOtpDto,
  ): Promise<any> {
    return await this.smsService.verifyOTP(token);
    ;
  }

  @Post('get-otp')
  async getOtp(
    @UserId() userId: number,
    @Body() body: any,
  ): Promise<any> {
    return await this.smsService.getOtp(userId,body);
  }

}
