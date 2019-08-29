const openpgp = require('openpgp');
const fs = require('fs');
const Promise = require('bluebird');

const PGPAction = require('./pgpAction');

class Encrypt extends PGPAction {
    async process(content, file) {
        const { pubKey } = this.config;
        const options = {
            publicKeys: (await openpgp.key.readArmored(this._base64ToUtf8(pubKey))).keys,
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

module.exports = new Encrypt();
