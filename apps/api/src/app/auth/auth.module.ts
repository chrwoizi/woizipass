import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AuthController } from './auth.controller';
import { CredentialStoreService } from '../credential-store/credential-store.service';
import { jwtConstants } from './auth.config';
const passportModule = PassportModule.register({ defaultStrategy: 'jwt' });

if (!jwtConstants.secret) {
  throw new Error('JWT secret not set');
}

@Module({
  imports: [
    passportModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: {
        expiresIn: jwtConstants.jwtTimeoutSeconds.toString(),
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, CredentialStoreService],
  exports: [AuthService, passportModule],
})
export class AuthModule {}
