const fs = require('fs');
const yargs = require('yargs');
const { ModeOfOperation } = require('aes-js');
const { createHash } = require('crypto');
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

const key = createHash('sha256').update(argv.password, 'utf8').digest();
const encrypted = fs.readFileSync(argv.inFile);
const decrypted = new ModeOfOperation.ctr(key).decrypt(encrypted);
const json = Buffer.from(decrypted).toString('utf-8');
if (!json?.startsWith('[')) {
    console.log("Incorrect password.");
    exit(-1);
}
fs.writeFileSync(argv.outFile, decrypted);
