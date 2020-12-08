import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AuthResponse, AuthTokenPayload, User } from '@woizpass/api-interfaces';
import { CredentialStoreService } from '../credential-store/credential-store.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly credentialStoreService: CredentialStoreService
  ) {}

  async validateUser(password: string): Promise<User> {
    await this.credentialStoreService.setMasterPassword(password);
    const user: User = {};
    return user;
  }

  login(): AuthResponse {
    const token: AuthTokenPayload = { app: 'woizpass' };
    return {
      idToken: this.jwtService.sign(token),
    };
  }

  async logout(): Promise<void> {
    await this.credentialStoreService.unsetMasterPassword();
  }
}
