function errorhandler(err, message, channel, log, config, fatal) {
    if(config.debug == 'true') console.log(err);
    else if(fatal && log) log.fatal(err);
    if(channel) return channel.send(message).catch(err => {});
    else return;
}

module.exports = {errorhandler}