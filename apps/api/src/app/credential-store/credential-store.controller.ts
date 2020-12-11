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
  UploadTextRequest,
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
  async changeMasterKey(@Body() body: ChangeMasterPassword): Promise<void> {
    await this.credentialStoreService.changeMasterPassword(
      body.oldKey,
      body.newKey
    );
  }

  @UseGuards(AuthAccessGuard)
  @HttpCode(HttpStatus.OK)
  @Post('download')
  async getFile(@Res() res, @Body() body: DownloadRequest) {
    const buffer = await this.credentialStoreService.getFile(body.key);

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
      body.key,
      body.newKey,
      file.buffer
    );
  }

  @UseGuards(AuthAccessGuard)
  @Post('download-text')
  async getFileText(@Body() body: DownloadRequest): Promise<string> {
    const buffer = await this.credentialStoreService.getFile(body.key);
    return buffer.toString('utf-8');
  }

  @UseGuards(AuthAccessGuard)
  @Post('upload-text')
  async putFileText(@Body() body: UploadTextRequest) {
    await this.credentialStoreService.putFile(
      body.key,
      body.newKey,
      Buffer.from(body.text, 'utf-8')
    );
  }
}
