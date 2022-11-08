<<<<<<< HEAD
const { GlobalConfig } = require('../utils/functions/data/GlobalConfig');
const { errorhandler } = require('../utils/functions/errorhandler/errorhandler');
const { stopBot } = require('./core/core');
=======
const {
    updateGlobalConfig
} = require("../utils/functions/data/ignoreMode");
const {
    errorhandler
} = require("../utils/functions/errorhandler/errorhandler");
const { stopBot } = require("./core/core");
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f

module.exports.rateLimit = async ({rateLimitData}) => {
    errorhandler({
        err: rateLimitData,
        message: 'The bot hit the rate limit. Enable ignoremode automatically.'
    });

    GlobalConfig.update({
        valueName: 'ignoreMode',
        value: 1
    });

    return stopBot();
}