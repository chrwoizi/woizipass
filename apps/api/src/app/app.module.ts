import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { JwtModule } from '@nestjs/jwt';

import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { AuthService } from './auth/auth.service';
import { CredentialStoreController } from './credential-store/credential-store.controller';
import { CredentialStoreModule } from './credential-store/credential-store.module';
import { CredentialStoreService } from './credential-store/credential-store.service';
import { CredentialController } from './credential/credential.controller';
import { CredentialModule } from './credential/credential.module';
import { CredentialService } from './credential/credential.service';
import { jwtConstants } from './auth/auth.config';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'client'),
    }),
    AuthModule,
    CredentialModule,
    CredentialStoreModule,
    JwtModule.register({
      secret: jwtConstants.secret,
      signOptions: { expiresIn: '2 days' },
    }),
  ],
  controllers: [
    AuthController,
    CredentialController,
    CredentialStoreController,
  ],
  providers: [AuthService, CredentialService, CredentialStoreService],
})
export class AppModule {}
