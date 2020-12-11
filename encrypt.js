const fs = require('fs');
const yargs = require('yargs');
const { SHA256, AES } = require('crypto-js');

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
    .alias('help', 'h')
    .argv;

const apiKey = SHA256(argv.password + '-api');
const clientKey = SHA256(argv.password + '-client');

const plaintextBuffer = fs.readFileSync(argv.inFile);

const credentials = JSON.parse(plaintextBuffer.toString('utf-8'));
for (const credential of credentials) {
    credential.password = AES.encrypt(credential.password, clientKey.toString()).toString();
}

const encrypted = AES.encrypt(JSON.stringify(credentials), apiKey.toString()).toString();
fs.writeFileSync(argv.outFile, Buffer.from(encrypted, 'utf-8'));
