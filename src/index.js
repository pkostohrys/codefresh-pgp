const decrypt = require('./decrypt');
const encrypt = require('./encrypt');
const { shouldDecrypt } = require('./config');

const main = async () => {
    const pgpAction = shouldDecrypt ? decrypt : encrypt;
    await pgpAction.validate().exec();
};

main().catch(err => {
    console.error(err.stack);
    process.exit(1);
});
