const {
    ACTION,
    PRIVATE_KEY,
    PUBLIC_KEY,
    PASS_PHRASE,
    GLOB
} = process.env;

module.exports = {
    action: ACTION,
    data: {
        pubKey: PUBLIC_KEY,
        privKey: PRIVATE_KEY,
        globExpression: GLOB,
        passPhrase: PASS_PHRASE,
    }
};
