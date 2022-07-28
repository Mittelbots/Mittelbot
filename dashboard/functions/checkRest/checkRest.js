const config = require('../../config');
module.exports.checkRest = (req, res, next) => {
    if(req.headers.origin !== `${config.domain}:${config.port}`) {
        res.status(403).send('Forbidden');
    }
    next();
}