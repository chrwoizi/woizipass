import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import {
  GetPasswordResponse,
  WoizCredential,
  WoizCredentials,
} from '@woizipass/api-interfaces';
import { AuthAccessGuard } from '../auth/auth-access.guard';
import { CredentialStoreService } from '../credential-store/credential-store.service';
import { CredentialService } from './credential.service';

@Controller('credential')
export class CredentialController {
  constructor(
    private readonly credentialService: CredentialService,
    private credentialStoreService: CredentialStoreService
  ) {}

  @UseGuards(AuthAccessGuard)
  @Get()
  async getCredentials(@Req() req): Promise<WoizCredentials> {
    await this.credentialStoreService.resetTtl(req.user?.userId);
    return await this.credentialService.getCredentials();
  }

  @UseGuards(AuthAccessGuard)
  @Get(':id')
  async getPassword(
    @Param('id') id: string,
    @Req() req
  ): Promise<GetPasswordResponse> {
    await this.credentialStoreService.resetTtl(req.user?.userId);
    return { password: await this.credentialService.getPassword(id) };
  }

  @UseGuards(AuthAccessGuard)
  @Post()
  async update(
    @Body()
    body: WoizCredential,
    @Req() req
  ): Promise<void> {
    await this.credentialStoreService.resetTtl(req.user?.userId);
    await this.credentialService.update(body);
  }

  @UseGuards(AuthAccessGuard)
  @Delete(':id')
  async deleteCredential(
    @Param('id')
    id: string,
    @Req() req
  ): Promise<void> {
    await this.credentialStoreService.resetTtl(req.user?.userId);
    await this.credentialService.deleteCredential(id);
  }
}
