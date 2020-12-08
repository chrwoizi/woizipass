import { Controller, UseGuards, Post, Req } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthResponse } from '@woizipass/api-interfaces';
import { AuthAccessGuard } from './auth-access.guard';
import { AuthService } from './auth.service';

@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req): Promise<AuthResponse> {
    return await this.authService.createJwtToken(req.user?.userId);
  }

  @UseGuards(AuthAccessGuard)
  @Post('logout')
  async logout(): Promise<void> {
    await this.authService.logout();
  }
}
