import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  DownloadRequest,
  ChangeMasterPassword,
  UploadRequest,
} from '@woizipass/api-interfaces';
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
  @Post('download')
  async getFile(@Res() res, @Body() body: DownloadRequest) {
    const buffer = await this.credentialStoreService.getFile(body.password);

    res.setHeader(
      'Content-Disposition',
      `attachment; filename=credentials.aes`
    );

    const stream = new Duplex();
    stream.push(buffer);
    stream.push(null);
    stream.pipe(res);
  }

  @UseGuards(AuthAccessGuard)
  @UseInterceptors(FileInterceptor('file'))
  @Post('upload')
  async putFile(@Body() body: UploadRequest, @UploadedFile() file) {
    await this.credentialStoreService.putFile(
      body.password,
      body.newPassword,
      file.buffer
    );
  }
}
