function errorhandler(err, message, channel, log, config) {
    if(config.debug == 'true') console.log(err);
    else log.fatal(err);
    return channel.send(message); 
}

module.exports = {errorhandler}