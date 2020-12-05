import { CacheModule, Global, Module } from '@nestjs/common';
import { CredentialStoreController } from './credential-store.controller';
import { CredentialStoreService } from './credential-store.service';

const cacheModule = CacheModule.register();

@Global()
@Module({
  imports: [cacheModule],
  controllers: [CredentialStoreController],
  providers: [CredentialStoreService],
  exports: [CredentialStoreService, cacheModule],
})
export class CredentialStoreModule {}
