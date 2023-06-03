const { GlobalConfig } = require('../../utils/functions/data/GlobalConfig');
const { shutdown } = require('../../utils/functions/data/Owner');
const { errorhandler } = require('../../utils/functions/errorhandler/errorhandler');

module.exports.rateLimit = async ({ rateLimitData }) => {
    errorhandler({
        err: rateLimitData,
        message: 'The bot hit the rate limit. Enable ignoremode automatically.',
    });

    GlobalConfig.update({
        valueName: 'ignoreMode',
        value: 1,
    }).catch((err) => {
        errorhandler({
            err,
            message: 'Error while updating the ignoremode.',
        });
    });

    return shutdown();
};
