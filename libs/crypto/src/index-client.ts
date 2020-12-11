import { AES, enc } from 'crypto-js';
declare let argon2: any;

const argon2Params = {
  time: 1,
  mem: 100 * 1024,
  hashLen: 32,
  type: argon2.ArgonType.Argon2id,
};

export async function createApiKey(password: string): Promise<string> {
  const result = await argon2.hash({
    ...argon2Params,
    pass: password,
    salt: 'api-salt', // at least 8 characters
  });
  return result.hashHex;
}

export async function createClientKey(password: string): Promise<string> {
  const result = await argon2.hash({
    ...argon2Params,
    pass: password,
    salt: 'cli-salt', // at least 8 characters
  });
  return result.hashHex;
}

export function encrypt(cleartext: string, key: string): string {
  return AES.encrypt(cleartext, key).toString();
}

export function decrypt(cipher: string, key: string): string {
  return AES.decrypt(cipher, key).toString(enc.Utf8);
}
