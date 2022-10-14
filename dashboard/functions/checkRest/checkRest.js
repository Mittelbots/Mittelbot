const config = require('../../config');
module.exports.checkRest = (req, res, next) => {
    const origin = config.mode == 'dev' ? `${config.domain}:${config.port}` : `${config.domain}`;
    if (req.headers.origin !== origin) {
        res.status(403).send('Forbidden');
    }
    next();
};
