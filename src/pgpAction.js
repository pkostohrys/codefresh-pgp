const glob = require('glob');
const fs = require('fs');
const Promise = require('bluebird');

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
        return new Buffer(str, 'base64').toString('utf8');
    }

    async exec() {
        const filesContent = await this._getFilesContent();
        const promises = filesContent.map(fileContent => {
            return this.process(fileContent.content, fileContent.file)
        });
        await Promise.all(promises.map(p => p.catch(err => console.log(err))));
    };
}

module.exports = PGPAction;
