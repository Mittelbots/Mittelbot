const cryptojs = require('crypto-js');
const jsonwebtoken = require('jsonwebtoken');

module.exports = (req, res) => {
    const authCode = req.headers['x-auth-code'];

    if (!authCode) {
        res.status(401).json({
            message: 'Unauthorized. No Auth Key provided',
        });
        return false;
    }

    const isLocalhost = req.headers.host.indexOf('localhost') > -1;

    let tmpAuthCode;
    if (isLocalhost) {
        tmpAuthCode = jsonwebtoken.verify(authKey, process.env.JWT_SECRET);
    } else {
        tmpAuthCode = jsonwebtoken.verify(authKey, process.env.JWT_SECRET).authCode;
    }

    const decryptedAuthCode = tmpAuthCode;

    console.log(decryptedAuthCode, 'decryptedAuthCode');

    if (!decryptedAuthCode) {
        res.status(401).json({
            message: 'Unauthorized. Invalid Auth Key provided',
        });
        return false;
    }

    const authCodeDecrypted = cryptojs.AES.decrypt(
        decryptedAuthCode,
        process.env.AUTH_KEY_SECRET
    ).toString(cryptojs.enc.Utf8);

    console.log(authCodeDecrypted);
    if (authCodeDecrypted.toLocaleLowerCase() !== process.env.AUTH_KEY.toLocaleLowerCase()) {
        res.status(401).json({
            message: 'Unauthorized',
        });
        return false;
    }

    return true;
};
