const openpgp = require('openpgp');
const fs = require('fs');
const Promise = require('bluebird');

const PGPAction = require('./action');

class Decrypt extends PGPAction {
    async process(content, file) {
        const { privKey, passPhrase } = this.config;
        const formattedContent = new TextDecoder().decode(content);

        const keys = await this.readKey(privKey);
        
        const privKeyObj = keys[0];
        privKeyObj.decrypt(passPhrase)

        const options = {
            message: await openpgp.message.readArmored(formattedContent),
            privateKeys: [privKeyObj],
            format: 'binary'
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

module.exports = new Decrypt();
