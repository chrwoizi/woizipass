const argon2Params = {
  time: 1,
  mem: 100 * 1024,
  hashLen: 32,
};

async function createApiKey(password) {
  const hash = await argon2.hash({
    ...argon2Params,
    type: argon2.ArgonType.Argon2id,
    pass: password,
    salt: 'api-salt', // at least 8 characters
  });
  return hash.hashHex;
}

async function createClientKey(password) {
  const hash = await argon2.hash({
    ...argon2Params,
    type: argon2.ArgonType.Argon2id,
    pass: password,
    salt: 'cli-salt', // at least 8 characters
  });
  return hash.hashHex;
}

function encrypt(cleartext, key) {
  return CryptoJS.AES.encrypt(cleartext, key).toString();
}

function decrypt(cipher, key) {
  return CryptoJS.AES.decrypt(cipher, key).toString(CryptoJS.enc.Utf8);
}
