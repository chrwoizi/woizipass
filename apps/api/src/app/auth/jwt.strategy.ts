import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { jwtConstants } from './auth.config';
import { AuthTokenPayload } from '@woizipass/api-interfaces';
import { AuthService } from './auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: AuthTokenPayload) {
    if (payload.app !== 'woizipass') {
      console.log(payload);
      throw new Error();
    }

    if (!payload.userId) {
      throw new Error();
    }

    if (!(await this.authService.validateUserId(payload.userId))) {
      throw new Error();
    }

    return { app: payload.app };
  }
}
