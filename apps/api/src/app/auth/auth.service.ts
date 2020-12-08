import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  AuthResponse,
  AuthTokenPayload,
  User,
} from '@woizipass/api-interfaces';
import { CredentialStoreService } from '../credential-store/credential-store.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly credentialStoreService: CredentialStoreService
  ) {}

  async validatePassword(password: string): Promise<User> {
    const userId = await this.credentialStoreService.login(password);
    const user: User = { userId: userId };
    return user;
  }

  async createJwtToken(userId: string): Promise<AuthResponse> {
    const isLoggedIn = await this.credentialStoreService.isLoggedIn(userId);
    if (!isLoggedIn) {
      throw new ForbiddenException();
    }

    const token: AuthTokenPayload = { app: 'woizipass', userId: userId };
    return {
      idToken: this.jwtService.sign(token),
    };
  }

  async validateUserId(userId: string): Promise<boolean> {
    return await this.credentialStoreService.isLoggedIn(userId);
  }

  async logout(): Promise<void> {
    await this.credentialStoreService.logout();
  }
}
