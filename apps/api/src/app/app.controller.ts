import { Body, Controller, Delete, Get, Param, Post } from '@nestjs/common';

import {
  ChangeMasterPassword,
  GetPasswordResponse,
  SetMasterPassword,
  WoizCredential,
  WoizCredentials,
} from '@woizpass/api-interfaces';

import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Post('set-master')
  async setMasterPassword(@Body() body: SetMasterPassword): Promise<void> {
    this.appService.setMasterPasswordAndCheck(body.password);
  }

  @Post('change-master')
  async changeMasterPassword(
    @Body() body: ChangeMasterPassword
  ): Promise<void> {
    this.appService.changeMasterPassword(body.oldPassword, body.newPassword);
  }

  @Get('credential')
  async getCredentials(): Promise<WoizCredentials> {
    return this.appService.getCredentials();
  }

  @Get('credential/:id')
  async getPassword(@Param('id') id: string): Promise<GetPasswordResponse> {
    return { password: this.appService.getPassword(id) };
  }

  @Post('credential')
  async setPassword(
    @Body()
    body: WoizCredential
  ): Promise<void> {
    this.appService.setPassword(
      body.id,
      body.provider,
      body.username,
      body.password
    );
  }

  @Delete('credential/:id')
  async deleteCredential(
    @Param('id')
    id: string
  ): Promise<void> {
    this.appService.deleteCredential(id);
  }
}
