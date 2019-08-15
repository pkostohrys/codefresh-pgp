const openpgp = require('openpgp');
const glob = require('glob');
const fs = require('fs');
const Promise = require('bluebird');
const pubkey = process.env.PUBLIC_KEY;
const globExpression = process.env.GLOB;

async function _encryptFile(content, file){

    const options = {
        publicKeys: (await openpgp.key.readArmored(new Buffer(pubkey, 'base64').toString('utf8'))).keys,
        message: openpgp.message.fromBinary(content),
        format: 'binary'
    };

    return openpgp.encrypt(options).then(ciphertext => {
        return Promise.fromCallback(cb => fs.writeFile(file, ciphertext.data, cb));
    });
}

const encrypt = async() => {

    if(!pubkey) {
        console.error('key should be provided');
        process.exit(1);
        return;
    }

    if(!globExpression) {
        console.error('files glob expression should be provided');
        process.exit(1);
        return;
    }

    const files = await Promise.fromCallback(cb => glob(globExpression, {}, cb));
    const filesContent = await Promise.all(files.map(async file => {
        const fileContent = await Promise.fromCallback(cb => fs.readFile(file, cb));
        return { file, content: new Uint8Array(fileContent) };
    }));

    const promises = filesContent.map(fileContent => {
        return _encryptFile(fileContent.content, fileContent.file);
    });

    await Promise.all(promises.map(p => p.catch(() => undefined)));
};

encrypt();
