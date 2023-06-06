const cryptojs = require('crypto-js');
const jsonwebtoken = require('jsonwebtoken');

module.exports = (req, res) => {
    const authKey = req.headers['x-auth-key'];

    if (!authKey) {
        res.status(401).json({
            message: 'Unauthorized. No Auth Key provided',
        });
        return false;
    }

    const isLocalhost = req.headers.host.indexOf('localhost') > -1;

    let decryptedAuthKey;
    if (isLocalhost) {
        decryptedAuthKey = jsonwebtoken.verify(authKey, process.env.JWT_SECRET);
    } else {
        decryptedAuthKey = jsonwebtoken.verify(authKey, process.env.JWT_SECRET).authKey;
    }

    console.log(decryptedAuthKey, 'decryptedAuthKey');

    if (!decryptedAuthKey) {
        res.status(401).json({
            message: 'Unauthorized. Invalid Auth Key provided',
        });
        return false;
    }

    const authKeyDecrypted = cryptojs.AES.decrypt(
        decryptedAuthKey,
        process.env.AUTH_KEY_SECRET
    ).toString(cryptojs.enc.Utf8);

    console.log(authKeyDecrypted);
    if (authKeyDecrypted.toLocaleLowerCase() !== process.env.AUTH_KEY.toLocaleLowerCase()) {
        res.status(401).json({
            message: 'Unauthorized',
        });
        return false;
    }

    return true;
};
