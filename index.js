const openpgp = require('openpgp');
const glob = require('glob');
const fs = require('fs');
const Promise = require('bluebird');
const yn = require('yn');

const decryption = yn(process.env.DECRYPT);
const globExpression = process.env.GLOB;
const pubkey = process.env.PUBLIC_KEY;
const privkey = process.env.PRIVAT_KEY;
const passphrase = process.env.PASS_PHRASE;

const base64ToUtf8 = str => new Buffer(str, 'base64').toString('utf8')

async function _encryptFile(content, file) {

    const options = {
        publicKeys: (await openpgp.key.readArmored(base64ToUtf8(pubkey))).keys,
        message: openpgp.message.fromBinary(content),
        format: 'binary'
    };

    return openpgp.encrypt(options).then(ciphertext => {
        return Promise.fromCallback(cb => fs.writeFile(file, ciphertext.data, cb));
    });
}

async function _decryptFile(content, file) {

    const formattedContent = new TextDecoder().decode(content);

    const privKeyObj = (await openpgp.key.readArmored(base64ToUtf8(privkey))).keys[0]
    privKeyObj.decrypt(passphrase);

    const options = {
        message: await openpgp.message.readArmored(formattedContent),
        privateKeys: [privKeyObj]
    }

    return openpgp.decrypt(options).then(decodedText => {
        return Promise.fromCallback(cb => fs.writeFile(file, decodedText.data, cb));
    });
}

const encryptDecrypt = async () => {
    if (!globExpression) {
        console.error('files glob expression should be provided');
        process.exit(1);
        return;
    }
    if (decryption) {
        if (!privkey) {
            console.error('privat key should be provided');
            process.exit(1);
            return;
        }
        if (!passphrase) {
            console.error('passphrase key should be provided');
            process.exit(1);
            return;
        }
    } else {
        if (!pubkey) {
            console.error('public key should be provided');
            process.exit(1);
            return;
        }
    }

    const files = await Promise.fromCallback(cb => glob(globExpression, {}, cb));
    const filesContent = await Promise.all(files.map(async file => {
        const fileContent = await Promise.fromCallback(cb => fs.readFile(file, cb));
        return { file, content: new Uint8Array(fileContent) };
    }));

    const promises = filesContent.map(fileContent => {
        return decryption
            ? _decryptFile(fileContent.content, fileContent.file)
            : _encryptFile(fileContent.content, fileContent.file);
    });

    await Promise.all(promises.map(p => p.catch(() => undefined)));
};

encryptDecrypt();
