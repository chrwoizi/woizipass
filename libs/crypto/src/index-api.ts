import { AES, enc } from 'crypto-js';
import * as argon2 from 'argon2';

const argon2Params = {
  timeCost: 1,
  memoryCost: 100 * 1024,
  hashLength: 32,
  type: argon2.argon2id,
};

export async function createApiKey(password: string): Promise<string> {
  const salt = 'api-salt';
  const result = await argon2.hash(password, {
    ...argon2Params,
    salt: Buffer.alloc(salt.length, salt),
    saltLength: salt.length,
    raw: true,
  });
  return result.toString('hex');
}

export async function createClientKey(password: string): Promise<string> {
  const salt = 'cli-salt';
  const result = await argon2.hash(password, {
    ...argon2Params,
    salt: Buffer.alloc(salt.length, salt),
    saltLength: salt.length,
    raw: true,
  });
  return result.toString('hex');
}

export function encrypt(cleartext: string, key: string): string {
  return AES.encrypt(cleartext, key).toString();
}

export function decrypt(cipher: string, key: string): string {
  return AES.decrypt(cipher, key).toString(enc.Utf8);
}
