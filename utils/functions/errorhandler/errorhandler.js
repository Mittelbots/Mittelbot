const { log, debug_log } = require("../../../logs");
const config = require('../../../src/assets/json/_config/config.json');

function errorhandler({err = '', message = '', channel = null, fatal = true}) {
    if(config.debug == 'true') console.log(err);

    else if(fatal && log) log.fatal(err);

    else if(!fatal) debug_log.info(err, message);

    if(channel) return channel.send(message).catch(err => {});
    else return;
}

module.exports = {errorhandler}