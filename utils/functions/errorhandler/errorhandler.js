const { log, debug_log, database_log } = require('./logs');
const callerId = require('caller-id');

module.exports.errorhandler = ({
    err = 'No error passed! ',
    message = 'No message passed! ',
    channel = null,
    fatal = true,
    databaseError = false,
}) => {
    const caller = callerId.getData();
    let errObj = {
        Message: message,
        'Called From': caller.filePath,
        Line: caller.lineNumber,
        '------------': '------------',
    };

    if (JSON.parse(process.env.DEBUG)) console.error(err, '\n', message, '\n', caller.filePath);
    else if (databaseError) database_log.error(err, '\n', JSON.stringify(errObj, null, 4));
    else if (fatal && log) log.fatal(err, '\n', JSON.stringify(errObj, null, 4));
    else if (!fatal) debug_log.info(err, '\n', JSON.stringify(errObj, null, 4));

    if (channel) return channel.send(message).catch((err) => {});
    else return;
};
