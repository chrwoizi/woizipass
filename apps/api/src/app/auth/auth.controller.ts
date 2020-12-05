import { Controller, UseGuards, Post } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthResponse } from '@woizpass/api-interfaces';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(AuthGuard('local'))
  @Post()
  async login(): Promise<AuthResponse> {
    return this.authService.login();
  }
}
