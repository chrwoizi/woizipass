import { Injectable, NotFoundException } from '@nestjs/common';
import { WoizCredentials } from '@woizpass/api-interfaces';
import { v4 } from 'uuid';
import { CredentialStoreService } from '../credential-store/credential-store.service';

@Injectable()
export class CredentialService {
  constructor(private credentialStoreService: CredentialStoreService) {}

  async getCredentials(): Promise<WoizCredentials> {
    const credentials = await this.credentialStoreService.load();
    return {
      credentials: credentials.map((x) => ({
        id: x.id,
        provider: x.provider,
        username: x.username,
      })),
    };
  }

  async getPassword(id: string): Promise<string> {
    const credentials = await this.credentialStoreService.load();
    const item = credentials.find((x) => x.id === id);
    return item?.password;
  }

  async setPassword(
    id: string,
    provider: string,
    username: string,
    password: string
  ) {
    const credentials = await this.credentialStoreService.load();
    const item = credentials.find((x) => x.id === id);
    if (item) item.password = password;
    else {
      credentials.push({
        id: v4(),
        provider: provider,
        username: username,
        password: password,
      });
    }
    await this.credentialStoreService.save(credentials);
  }

  async deleteCredential(id: string) {
    const credentials = await this.credentialStoreService.load();

    const item = credentials.find((x) => x.id === id);
    console.log(id);
    console.log(item);
    if (!item) {
      throw new NotFoundException();
    }

    credentials.splice(credentials.indexOf(item), 1);
    await this.credentialStoreService.save(credentials);
  }
}
