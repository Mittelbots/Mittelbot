const { log, debug_log } = require('./logs');
const config = require('../../../src/assets/json/_config/config.json');
const callerId = require('caller-id');

module.exports.errorhandler = ({
    err = 'No error passed! ',
    message = 'No message passed! ',
    channel = null,
    fatal = true,
}) => {
    const caller = callerId.getData();
    let errObj = {
        Message: message,
        'Called From': caller.filePath,
        Line: caller.lineNumber,
        '------------': '------------',
    };

    if (JSON.parse(process.env.DEBUG)) console.log(err, '\n', message);
    else if (fatal && log) log.fatal(err, '\n', JSON.stringify(errObj, null, 4));
    else if (!fatal) debug_log.info(err, '\n', JSON.stringify(errObj, null, 4));

    if (channel) return channel.send(message).catch((err) => {});
    else return;
};
