import {
  CACHE_MANAGER,
  ForbiddenException,
  Global,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { WoizCredential } from '@woizipass/api-interfaces';
import { decrypt, encrypt } from '@woizipass/crypto-api';
import * as fs from 'fs';
import { Cache } from 'cache-manager';
import { v4 } from 'uuid';
import { jwtConstants } from '../auth/auth.config';

@Injectable()
@Global()
export class CredentialStoreService {
  static readonly databaseDir = 'data';
  static readonly databasePath = 'data/database';

  constructor(@Inject(CACHE_MANAGER) private cacheManager: Cache) {}

  private async getCachedKey() {
    return await this.cacheManager.get('key');
  }

  private async setCachedKey(key: string) {
    if (key) {
      await this.cacheManager.set('key', key, {
        ttl: jwtConstants.sessionTimeoutSeconds,
      });
    } else {
      await this.cacheManager.del('key');
    }
  }

  async isLoggedIn(userId: string): Promise<boolean> {
    const key = await this.getCachedKey();
    if (!key) return false;

    // reset ttl
    await this.cacheManager.set('key', key, {
      ttl: jwtConstants.sessionTimeoutSeconds,
    });

    const userExists = await this.cacheManager.get(userId);
    if (!userExists) return false;

    // reset ttl
    await this.cacheManager.set(userId, true, {
      ttl: jwtConstants.sessionTimeoutSeconds,
    });

    return true;
  }

  async login(newKey: string): Promise<string> {
    if (!newKey) {
      throw new ForbiddenException();
    }

    try {
      const credentials = await this.load(newKey);
      if (typeof credentials?.length !== 'number') {
        throw new ForbiddenException();
      }

      await this.setCachedKey(newKey);

      const userId = v4();
      await this.cacheManager.set(userId, true, {
        ttl: jwtConstants.sessionTimeoutSeconds,
      });
      return userId;
    } catch {
      throw new ForbiddenException();
    }
  }

  async logout() {
    await this.cacheManager.reset();
  }

  async load(keyOverride?: string): Promise<WoizCredential[]> {
    const key = keyOverride || (await this.getCachedKey());
    if (!key) {
      throw new ForbiddenException();
    }

    if (!fs.existsSync(CredentialStoreService.databasePath)) {
      return [];
    }

    const encrypted = fs.readFileSync(CredentialStoreService.databasePath);
    const json = this.decryptFile(key, encrypted);

    return JSON.parse(json);
  }

  async save(credentials: WoizCredential[], keyOverride?: string) {
    const key = keyOverride || (await this.getCachedKey());
    if (!key) {
      throw new ForbiddenException();
    }

    const encrypted = Buffer.from(
      encrypt(JSON.stringify(credentials), key),
      'utf-8'
    );
    if (!fs.existsSync(CredentialStoreService.databaseDir)) {
      fs.mkdirSync(CredentialStoreService.databaseDir);
    }
    fs.writeFileSync(CredentialStoreService.databasePath, encrypted);
  }

  async getFile(key: string): Promise<Buffer> {
    if (!key) {
      throw new ForbiddenException();
    }

    try {
      await this.load(key);
    } catch {
      throw new ForbiddenException();
    }

    if (!fs.existsSync(CredentialStoreService.databasePath)) {
      throw new NotFoundException();
    }

    return fs.readFileSync(CredentialStoreService.databasePath);
  }

  async putFile(key: string, newKey: string, file: Buffer): Promise<void> {
    if (!key) {
      throw new ForbiddenException();
    }

    if (!newKey) {
      throw new ForbiddenException();
    }

    try {
      await this.load(key);
    } catch {
      throw new ForbiddenException();
    }

    const json = this.decryptFile(newKey, file);
    if (!json) {
      throw new InternalServerErrorException();
    }

    fs.writeFileSync(CredentialStoreService.databasePath, file);
    await this.logout();
  }

  decryptFile(key: string, encrypted: Buffer) {
    const json = decrypt(encrypted.toString('utf-8'), key);

    if (!json?.startsWith('[')) {
      throw new ForbiddenException();
    }
    return json;
  }
}
