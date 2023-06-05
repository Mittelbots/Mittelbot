const cryptojs = require('crypto-js');
const jsonwebtoken = require('jsonwebtoken');

module.exports = (req, res) => {
    const password = req.headers['x-password'];
    const email = req.headers['x-email'];
    if (!password || !email || password === '' || email === '') {
        res.status(401).json({
            message: 'Unauthorized',
        });
        return false;
    }

    const authKey = cryptojs.AES.encrypt(
        process.env.AUTH_KEY,
        process.env.AUTH_KEY_SECRET
    ).toString();

    //todo check if user exists & save password encrypted
    const data = {
        email: email,
        password: password,
        authKey: authKey,
    };

    const token = jsonwebtoken.sign(data, process.env.JWT_SECRET);
    res.status(200).json({
        token: token,
    });

    return true;
};

module.exports.config = {
    path: '/auth',
    method: 'get',
    bypassAuth: true,
};
