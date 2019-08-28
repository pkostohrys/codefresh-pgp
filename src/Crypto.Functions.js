const openpgp = require('openpgp');
const glob = require('glob');
const fs = require('fs');
const Promise = require('bluebird');

const base64ToUtf8 = str => new Buffer(str, 'base64').toString('utf8')

class Generic {
    constructor(config) {
        this.config = config;

        if (!this.config.globExpression) {
            console.error('Files glob expression should be provided');
            process.exit(1);
        }
    }

    async _getFilesContent() {
        const files = await Promise.fromCallback(cb => glob(this.config.globExpression, {}, cb));
        return await Promise.all(files.map(async file => {
            const fileContent = await Promise.fromCallback(cb => fs.readFile(file, cb));
            return { file, content: new Uint8Array(fileContent) };
        }));
    }

    async run() {
        const filesContent = await this._getFilesContent();

        const promises = filesContent.map(fileContent => {
            return this.exec(fileContent.content, fileContent.file)
        });

        await Promise.all(promises.map(p => p.catch(() => undefined)));
    };
}

exports.Encrypt = class Encrypt extends Generic {
    async exec(content, file) {
        const { pubKey } = this.config;

        const options = {
            publicKeys: (await openpgp.key.readArmored(base64ToUtf8(pubKey))).keys,
            message: openpgp.message.fromBinary(content),
            format: 'binary'
        };
    
        return openpgp.encrypt(options).then(ciphertext => {
            return Promise.fromCallback(cb => fs.writeFile(file, ciphertext.data, cb));
        });
    }

    validate() {
        const { pubKey } = this.config;

        if (!pubKey) {
            console.error('Public key should be provided');
            process.exit(1);
            return;
        }
        return this;
    }
}

exports.Decrypt = class Decrypt extends Generic {
    async exec(content, file) {
        const { privKey, passPhrase } = this.config;

        const formattedContent = new TextDecoder().decode(content);
    
        const privKeyObj = (await openpgp.key.readArmored(base64ToUtf8(privKey))).keys[0]
        privKeyObj.decrypt(passPhrase);
    
        const options = {
            message: await openpgp.message.readArmored(formattedContent),
            privateKeys: [privKeyObj]
        }
    
        return openpgp.decrypt(options).then(decodedText => {
            return Promise.fromCallback(cb => fs.writeFile(file, decodedText.data, cb));
        });
    }
    
    validate() {
        const { privKey, passPhrase } = this.config;

        if (!privKey) {
            console.error('Privat key should be provided');
            process.exit(1);
            return;
        }
        if (!passPhrase) {
            console.error('Passphrase key should be provided');
            process.exit(1);
            return;
        }
        return this;
    }
}