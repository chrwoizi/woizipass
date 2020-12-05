import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { ChangeMasterPassword } from '@woizpass/api-interfaces';
import { AuthAccessGuard } from '../auth/auth-access.guard';
import { CredentialStoreService } from './credential-store.service';

@Controller('')
export class CredentialStoreController {
  constructor(
    private readonly credentialStoreService: CredentialStoreService
  ) {}

  @UseGuards(AuthAccessGuard)
  @Post('change-master')
  async changeMasterPassword(
    @Body() body: ChangeMasterPassword
  ): Promise<void> {
    await this.credentialStoreService.changeMasterPassword(
      body.oldPassword,
      body.newPassword
    );
  }
}
