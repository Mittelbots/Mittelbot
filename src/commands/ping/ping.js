const config = require('../../../src/assets/json/_config/config.json');

module.exports.run = async (bot, message, args) => {
    if(config.deleteCommandsAfterUsage == 'true') {
        message.delete().catch(err => {});
    }
    message.channel.send(`Pong!`).then(msg => {
        setTimeout(() => {
            if(config.debug == 'true') console.info('Ping command passed!')
            return msg.edit(`Latency is ${Date.now() - message.createdTimestamp}ms. API Latency is ${Math.round(bot.ws.ping)}ms`).catch(err => {});
        }, 1000);
    }).catch(err => {});
}

module.exports.help = {
    name:"ping"
}