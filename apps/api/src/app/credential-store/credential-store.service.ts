import {
  CACHE_MANAGER,
  ForbiddenException,
  Global,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { WoizCredential } from '@woizipass/api-interfaces';
import { ModeOfOperation } from 'aes-js';
import { createHash } from 'crypto';
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
    const key = await this.cacheManager.get('key');
    return key && Buffer.from(key, 'base64');
  }

  private async setCachedKey(key: Buffer) {
    if (key) {
      await this.cacheManager.set('key', key.toString('base64'), {
        ttl: jwtConstants.sessionTimeoutSeconds,
      });
    } else {
      await this.cacheManager.del('key');
    }
  }

  async isLoggedIn(userId: string): Promise<boolean> {
    const key = await this.getCachedKey();
    if (!key) return false;

    const userExists = await this.cacheManager.get(userId);
    if (!userExists) return false;

    return true;
  }

  async login(password: string): Promise<string> {
    if (!password) {
      throw new ForbiddenException();
    }

    const newKey = createHash('sha256').update(password, 'utf8').digest();

    try {
      const credentials = await this.load(newKey);
      if (typeof credentials?.length !== 'number') {
        throw new ForbiddenException();
      }

      await this.setCachedKey(newKey);

      const userId = v4();
      this.cacheManager.set(userId, true, {
        ttl: jwtConstants.sessionTimeoutSeconds,
      });
      return userId;
    } catch {
      throw new ForbiddenException();
    }
  }

  async logout() {
    this.cacheManager.reset();
  }

  async changeMasterPassword(oldPassword: string, newPassword: string) {
    if (!oldPassword) {
      throw new ForbiddenException();
    }

    if (!newPassword) {
      throw new ForbiddenException();
    }

    const oldKey = createHash('sha256').update(oldPassword, 'utf8').digest();
    const newKey = createHash('sha256').update(newPassword, 'utf8').digest();

    try {
      const data = await this.load(oldKey);
      await this.save(data, newKey);
      await this.setCachedKey(newKey);
    } catch {
      throw new ForbiddenException();
    }
  }

  async load(keyArg?: Buffer): Promise<WoizCredential[]> {
    const key = keyArg || (await this.getCachedKey());
    if (!key) {
      throw new ForbiddenException();
    }

    if (!fs.existsSync(CredentialStoreService.databasePath)) {
      return [];
    }

    const encrypted = fs.readFileSync(CredentialStoreService.databasePath);
    const json = Buffer.from(
      new ModeOfOperation.ctr(key).decrypt(encrypted)
    ).toString('utf-8');

    if (!json?.startsWith('[')) {
      throw new ForbiddenException();
    }

    return JSON.parse(json);
  }

  async save(credentials: WoizCredential[], keyArg?: Buffer) {
    const key = keyArg || (await this.getCachedKey());
    if (!key) {
      throw new ForbiddenException();
    }

    const buffer = Buffer.from(JSON.stringify(credentials), 'utf-8');
    const encrypted = Buffer.from(new ModeOfOperation.ctr(key).encrypt(buffer));
    if (!fs.existsSync(CredentialStoreService.databaseDir)) {
      fs.mkdirSync(CredentialStoreService.databaseDir);
    }
    fs.writeFileSync(CredentialStoreService.databasePath, encrypted);
  }

  async getFile(password: string): Promise<Buffer> {
    if (!password) {
      throw new ForbiddenException();
    }

    const key = createHash('sha256').update(password, 'utf8').digest();

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
}
