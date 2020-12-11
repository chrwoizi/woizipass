const fs = require('fs');
const yargs = require('yargs');
const { SHA256, AES, enc } = require('crypto-js');
const { exit } = require('process');

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
    .alias('help', 'h')
    .argv;

const apiKey = SHA256(argv.password + '-api');
const clientKey = SHA256(argv.password + '-client');

const encrypted = fs.readFileSync(argv.inFile);

const json = AES.decrypt(encrypted.toString('utf-8'), apiKey.toString()).toString(enc.Utf8);

if (!json?.startsWith('[')) {
    console.log("Incorrect password.");
    exit(-1);
}

const credentials = JSON.parse(json);
for (const credential of credentials) {
    credential.password = AES.decrypt(credential.password, clientKey.toString()).toString(enc.Utf8);
}

const decrypted = JSON.stringify(credentials);

fs.writeFileSync(argv.outFile, Buffer.from(decrypted, 'utf-8'));
