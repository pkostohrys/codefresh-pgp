const decrypt = require('./decrypt');
const encrypt = require('./encrypt');
const { action } = require('./config');

const main = async () => {
    console.info('\n');

    console.log(JSON.stringify(process.env));

    let pgpAction;
    if (action === 'decrypt') {
        pgpAction = decrypt;
    } else if (action === 'encrypt') {
        pgpAction = encrypt;
    } else {
        throw new Error('Action parameter is missing. Should be equal to \'encrypt\' or \'decrypt\'');
    };

    await pgpAction.validate().exec();

    console.info('\n');
};

main().catch(err => {
    console.error(err.stack);
    process.exit(1);
});
