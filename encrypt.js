const fs = require('fs');
const yargs = require('yargs');
const { ModeOfOperation } = require('aes-js');
const { createHash } = require('crypto');

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

const key = createHash('sha256').update(argv.password, 'utf8').digest();
const plaintext = fs.readFileSync(argv.inFile);
const encrypted = Buffer.from(new ModeOfOperation.ctr(key).encrypt(plaintext));
fs.writeFileSync(argv.outFile, encrypted);
