import * as fs from 'fs';
import * as yargs from 'yargs';
import {
  createApiKey,
  createClientKey,
  encrypt,
} from '../../libs/crypto/src/index-api';

const argv = yargs
  .option('inFile', {
    alias: 'i',
    description: 'The plaintext input file path',
    type: 'string',
  })
  .option('outFile', {
    alias: 'o',
    description: 'The encrypted output file path',
    type: 'string',
  })
  .option('password', {
    alias: 'p',
    description: 'The password',
    type: 'string',
  })
  .help()
  .alias('help', 'h').argv;

(async () => {
  const apiKey = await createApiKey(argv.password);
  const clientKey = await createClientKey(argv.password);

  const plaintextBuffer = fs.readFileSync(argv.inFile);

  const credentials = JSON.parse(plaintextBuffer.toString('utf-8'));
  for (const credential of credentials) {
    credential.password = encrypt(credential.password, clientKey);
  }

  const encrypted = encrypt(JSON.stringify(credentials), apiKey);
  fs.writeFileSync(argv.outFile, Buffer.from(encrypted, 'utf-8'));
})();
