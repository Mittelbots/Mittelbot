const { log, debug_log } = require("../../../logs");
const config = require('../../../src/assets/json/_config/config.json');
const callerId = require('caller-id');

module.exports.errorhandler = ({err = 'No error passed! ', message = 'No message passed! ', channel = null, fatal = true}) => {
    const caller = callerId.getData();

    let errObj = {
        'Error:': err.toString(),
        'Message': message,
        'Called From': caller.filePath,
        'Line': caller.lineNumber
    }

    if(config.debug) console.log(errObj);

    else if(fatal && log) log.fatal(errObj);

    else if(!fatal) debug_log.info(errObj);

    if(channel) return channel.send(message).catch(err => {});
    else return;
}