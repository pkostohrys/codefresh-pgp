const { Encrypt, Decrypt } = require('./Crypto.Functions');
const config = require('./config');

const main = async () => {
    const Action = config.decrypt ? Decrypt : Encrypt;
    await (new Action(config.data)).validate().run();
};

main().catch(err => {
    console.error(err.stack);
    process.exit(1);
});
