import * as fs from 'fs';
import * as yargs from 'yargs';
import { exit } from 'process';
import {
  createApiKey,
  createClientKey,
  decrypt,
} from '../../libs/crypto/src/index-api';

const argv = yargs
  .option('inFile', {
    alias: 'i',
    description: 'The encrypted input file path',
    type: 'string',
  })
  .option('outFile', {
    alias: 'o',
    description: 'The decrypted output file path',
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

  const encrypted = fs.readFileSync(argv.inFile);

  const json = decrypt(encrypted.toString('utf-8'), apiKey);

  if (json?.indexOf('[') !== 0) {
    console.log('Incorrect password.');
    exit(-1);
  }

  const credentials = JSON.parse(json);
  for (const credential of credentials) {
    credential.password = decrypt(credential.password, clientKey);
  }

  const decrypted = JSON.stringify(credentials);

  fs.writeFileSync(argv.outFile, Buffer.from(decrypted, 'utf-8'));
})();
