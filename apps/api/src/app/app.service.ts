import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { WoizCredential, WoizCredentials } from '@woizpass/api-interfaces';
import { ModeOfOperation } from 'aes-js';
import { createHash } from 'crypto';
import * as fs from 'fs';
import { v4 } from 'uuid';

const databaseDir = 'data';
const databasePath = databaseDir + '/database';

@Injectable()
export class AppService {
  private key: Buffer;

  setMasterPasswordAndCheck(password: string) {
    if (!password) {
      throw new UnauthorizedException();
    }

    const key = this.key;

    this.key = createHash('sha256').update(password, 'utf8').digest();

    try {
      this.load();
    } catch {
      this.key = key;
      throw new UnauthorizedException();
    }
  }

  setMasterPassword(password: string) {
    if (!password) {
      throw new UnauthorizedException();
    }
    this.key = createHash('sha256').update(password, 'utf8').digest();
  }

  changeMasterPassword(oldPassword: string, newPassword: string) {
    this.setMasterPassword(oldPassword);
    const credentials = this.load();
    this.setMasterPassword(newPassword);
    this.save(credentials);
  }

  load(): WoizCredential[] {
    if (!this.key) {
      throw new UnauthorizedException();
    }

    if (!fs.existsSync(databasePath)) {
      return [];
    }

    const encrypted = fs.readFileSync(databasePath);
    const json = Buffer.from(
      new ModeOfOperation.ctr(this.key).decrypt(encrypted)
    ).toString('utf-8');

    if (!json?.startsWith('[')) {
      throw new UnauthorizedException();
    }

    return JSON.parse(json);
  }

  save(credentials: WoizCredential[]) {
    const buffer = Buffer.from(JSON.stringify(credentials), 'utf-8');
    const encrypted = Buffer.from(
      new ModeOfOperation.ctr(this.key).encrypt(buffer)
    );
    if (!fs.existsSync(databaseDir)) {
      fs.mkdirSync(databaseDir);
    }
    fs.writeFileSync(databasePath, encrypted);
  }

  getCredentials(): WoizCredentials {
    const credentials = this.load();
    return {
      credentials: credentials.map((x) => ({
        id: x.id,
        provider: x.provider,
        username: x.username,
      })),
    };
  }

  getPassword(id: string): string {
    const item = this.load().find((x) => x.id === id);
    return item?.password;
  }

  setPassword(
    id: string,
    provider: string,
    username: string,
    password: string
  ) {
    const credentials = this.load();
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
    this.save(credentials);
  }

  deleteCredential(id: string) {
    const credentials = this.load();

    const item = credentials.find((x) => x.id === id);
    console.log(id);
    console.log(item);
    if (!item) {
      throw new NotFoundException();
    }

    credentials.splice(credentials.indexOf(item), 1);
    this.save(credentials);
  }
}
