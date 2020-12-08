import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { BackupRequest, ChangeMasterPassword } from '@woizipass/api-interfaces';
import { Duplex } from 'stream';
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

  @UseGuards(AuthAccessGuard)
  @HttpCode(HttpStatus.OK)
  @Post('file')
  async getFile(@Res() res, @Body() body: BackupRequest) {
    const buffer = await this.credentialStoreService.getFile(body.password);

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=credentials.aes`
    );

    let stream = new Duplex();
    stream.push(buffer);
    stream.push(null);
    stream.pipe(res);
  }
}
