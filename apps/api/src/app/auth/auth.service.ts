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
    try {
      await this.credentialStoreService.setMasterPassword(password);
      const user: User = {};
      return user;
    } catch (e) {
      return null;
    }
  }

  login(): AuthResponse {
    const token: AuthTokenPayload = { app: 'woizpass' };
    return {
      idToken: this.jwtService.sign(token),
    };
  }
}
