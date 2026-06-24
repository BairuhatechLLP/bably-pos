import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth/staff')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('email-login')
  async emailLogin(@Body() loginDto: { email: string; password: string }) {
    return this.authService.emailLogin(loginDto.email, loginDto.password);
  }
}
