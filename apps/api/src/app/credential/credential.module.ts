import { Module } from '@nestjs/common';
import { CredentialService } from './credential.service';
import { CredentialController } from './credential.controller';
import { CredentialStoreService } from '../credential-store/credential-store.service';

@Module({
  imports: [],
  controllers: [CredentialController],
  providers: [CredentialService, CredentialStoreService],
  exports: [CredentialService, CredentialStoreService],
})
export class CredentialModule {}
