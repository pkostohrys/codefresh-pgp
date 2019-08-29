const glob = require('glob');
const fs = require('fs');
const Promise = require('bluebird');
const openpgp = require('openpgp');

const { data } = require('./config');

class PGPAction {
    constructor() {
        this.config = data;
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

    _base64ToUtf8(str) {
        return Buffer.from(str, 'base64').toString('utf8');
    }

    async readKey(base64Key) {
        const { keys, err } = await openpgp.key.readArmored(this._base64ToUtf8(base64Key));

        //  checking for errors while reading key
        if (Array.isArray(err) && err.length > 0) {
            let errMessages = '';
            err.forEach((e, i) => errMessages += `\n${i + 1}. ${e.message}`);
            throw new Error(`PGP keys reading failed ${errMessages}`);
        }

        return keys;
    }

    async exec() {
        const filesContent = await this._getFilesContent();
        const promises = filesContent.map(fileContent => {
            return this.process(fileContent.content, fileContent.file)
        });
        await Promise.all(promises.map(p => p.catch(err => console.error(err))));
    };
}

module.exports = PGPAction;
