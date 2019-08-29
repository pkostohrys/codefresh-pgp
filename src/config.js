const yn = require('yn');

const {
    DECRYPT,
    PRIVAT_KEY,
    PUBLIC_KEY,
    PASS_PHRASE,
    GLOB
} = process.env;

module.exports = {
    shouldDecrypt: yn(DECRYPT),
    data: {
        pubKey: PUBLIC_KEY,
        privKey: PRIVAT_KEY,
        globExpression: GLOB,
        passPhrase: PASS_PHRASE,
    }
};
