import { Injectable, NotFoundException } from '@nestjs/common';
import { WoizCredential, WoizCredentials } from '@woizpass/api-interfaces';
import { v4 } from 'uuid';
import { CredentialStoreService } from '../credential-store/credential-store.service';

function sortDate(a, b) {
  if (!a.accessedAt) return 1;
  if (!b.accessedAt) return -1;
  const ta = new Date(a.accessedAt).getTime();
  const tb = new Date(b.accessedAt).getTime();
  if (ta === tb) return 0;
  return ta > tb ? -1 : 1;
}

@Injectable()
export class CredentialService {
  constructor(private credentialStoreService: CredentialStoreService) {}

  async getCredentials(): Promise<WoizCredentials> {
    const credentials = await this.credentialStoreService.load();
    return {
      credentials: credentials
        .map((x) => ({ ...x, password: undefined }))
        .sort(sortDate),
    };
  }

  async getPassword(id: string): Promise<string> {
    const credentials = await this.credentialStoreService.load();
    const item = credentials.find((x) => x.id === id);
    if (item) {
      item.accessedAt = new Date();
      await this.credentialStoreService.save(credentials);
    }
    return item?.password;
  }

  async update(credential: WoizCredential) {
    const credentials = await this.credentialStoreService.load();
    if (credential.id) {
      const item = credentials.find((x) => x.id === credential.id);
      if (!item) {
        throw new NotFoundException();
      }
      Object.assign(item, {
        ...credential,
        id: item.id,
        accessedAt: item.accessedAt,
        password: credential.password || item.password,
      });
    } else {
      credentials.push({
        ...credential,
        id: v4(),
        accessedAt: new Date(),
      });
    }
    await this.credentialStoreService.save(credentials);
  }

  async deleteCredential(id: string) {
    const credentials = await this.credentialStoreService.load();

    const item = credentials.find((x) => x.id === id);
    if (!item) {
      throw new NotFoundException();
    }

    credentials.splice(credentials.indexOf(item), 1);
    await this.credentialStoreService.save(credentials);
  }
}
