import { Body, Controller, Get, Param, Post, UseInterceptors } from '@nestjs/common';
import { ApiBearerAuth, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { CommonResponseDto } from '../shared/dto/common-response.dto';
import { AuthService } from './auth.service';
import { login_Email, login_google, login_phone } from './dto/login.dto';
import {
  ForgotPasswordDto,
  newpasswordPasswordDto,
} from './dto/forgotPassword.dto';
import { signup_Register } from './dto/signup.dto';
import { UserEmailUpdateDto } from './dto/updateEmail.dto';
import { UserPhoneUpdateDto } from './dto/updatePhonenumber.dto';
import { UserId } from '../shared/decorators/userId_decorator';
import { Public } from '../shared/decorators/public.decorator';
import { ErrorsInterceptor } from '../shared/interceptor/error.interceptor';
import { SubscriptionFree } from '../shared/decorators/subscriptionFree.decorator';

@Controller('auth')
@ApiTags('auth')
@SubscriptionFree()
@UseInterceptors(ErrorsInterceptor)
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}

  @Post('email-login')
  @Public()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  async login(@Body() email_login: login_Email) {
    return await this.AuthService.login(email_login);
  }

  @Post('/Phone-login')
  @Public()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  async phoneLogin(@Body() phone_login: login_phone) {
    return this.AuthService.phoneLogin(phone_login);
  }

  @Post('/google_login')
  @Public()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  async googleLogin(@Body() google_login: login_google) {
    return this.AuthService.googleLogin(google_login);
  }

  @Post('forgot-password')
  @Public()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  forgot(@Body() forgot: ForgotPasswordDto) {
    return this.AuthService.forgotPassword(forgot);
  }

  @Post('reset-password')
  @Public()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  resetPassword(@Body() resetPassword: newpasswordPasswordDto) {
    return this.AuthService.changePassword(resetPassword);
  }
  @Post('/register')
  @Public()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  async register(@Body() signup_register: signup_Register) {
    return this.AuthService.register(signup_register);
  }

  @Post('/updatePhonenumber/:id')
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  async updatePhonenumber(
    @Param('id') id: string,
    @Body() Phone_number: UserPhoneUpdateDto,
  ) {
    return this.AuthService.updatePhoneNumber(Phone_number, id);
  }

  @Post('/updateEmail')
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  async updateEmail(@Body() body: UserEmailUpdateDto) {
    return this.AuthService.updateEmail(body);
  }

  @Get('/verifyEmail/:userId/:token')
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  async verifyEmail(
    @Param('userId') userId: string,
    @Param('token') token: string,
  ) {
    return this.AuthService.verifyEmail(userId, token);
  }

  @Get('/send_verify_mail')
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  async sendVerificationEmail(
    @UserId() userId: number,
  ) {
    return this.AuthService.sendVerificationEmail(userId);
  }

  @Get('/send_verify_mail_retail/:id')
  @Public()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  async sendVerificationEmailRetail(
    @Param('id') id: number,
  ) {
    return this.AuthService.sendVerificationEmailRetail(id);
  }

  // staff
  @Post('staff/email-login')
  @Public()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  async staffEmailLogin(@Body() staff_login: any) {
    return await this.AuthService.staffEmailLogin(staff_login);
  }

  @Post('/send-update-email/:id')
  @Public()
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  async sendUpdateEmail(
    @Param('id') id: number,
    @Body() bodyData: any
  ) {
    return this.AuthService.sendUpdateEmail(id,bodyData);
  }

  @Post('/update-mobile')
  @ApiOkResponse({ type: CommonResponseDto })
  @ApiBearerAuth()
  async updatePhoneNumberWithWhatsapp(
    @UserId() userId: number,
    @Body() bodyData: any
  ) {
    return this.AuthService.updatePhoneNumberWithWhatsapp(userId,bodyData);
  }
  
}
