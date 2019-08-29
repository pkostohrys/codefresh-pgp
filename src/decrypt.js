const openpgp = require('openpgp');
const fs = require('fs');
const Promise = require('bluebird');

const Runner = require('./runner');

class Decrypt extends Runner {
    async exec(content, file) {
        const { privKey, passPhrase } = this.config;

        const formattedContent = new TextDecoder().decode(content);
    
        const privKeyObj = (await openpgp.key.readArmored(this._base64ToUtf8(privKey))).keys[0]
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

module.exports = Decrypt;
