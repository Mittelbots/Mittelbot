function errorhandler(err, message, channel, log, config) {
    if(config.debug == 'true') console.log(err);
    else log.fatal(err);
    if(channel) return channel.send(message).catch(err => {});
    else return;
}

module.exports = {errorhandler}