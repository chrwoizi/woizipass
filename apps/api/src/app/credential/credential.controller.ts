import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  GetPasswordResponse,
  WoizCredential,
  WoizCredentials,
} from '@woizpass/api-interfaces';
import { AuthAccessGuard } from '../auth/auth-access.guard';
import { CredentialService } from './credential.service';

@Controller('credential')
export class CredentialController {
  constructor(private readonly credentialService: CredentialService) {}

  @UseGuards(AuthAccessGuard)
  @Get()
  async getCredentials(): Promise<WoizCredentials> {
    return await this.credentialService.getCredentials();
  }

  @UseGuards(AuthAccessGuard)
  @Get(':id')
  async getPassword(@Param('id') id: string): Promise<GetPasswordResponse> {
    return { password: await this.credentialService.getPassword(id) };
  }

  @UseGuards(AuthAccessGuard)
  @Post()
  async setPassword(
    @Body()
    body: WoizCredential
  ): Promise<void> {
    await this.credentialService.setPassword(
      body.id,
      body.provider,
      body.username,
      body.password
    );
  }

  @UseGuards(AuthAccessGuard)
  @Delete(':id')
  async deleteCredential(
    @Param('id')
    id: string
  ): Promise<void> {
    await this.credentialService.deleteCredential(id);
  }
}
