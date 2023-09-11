const { errorhandler } = require('./errorhandler');

module.exports.processErrorHandler = () => {
    process.on('unhandledRejection', async (err) => {
        errorhandler({
            err,
            fatal: true,
        });
    });

    process.on('uncaughtException', async (err) => {
        errorhandler({
            err,
            fatal: true,
        });
    });
};
