const config = require('../../../config.json');

module.exports.run = async (bot, message, args) => {
    if(config.deleteCommandsAfterUsage == 'true') {
        message.delete();
    }
    message.channel.send(`Pong!`).then(msg => {
        setTimeout(() => {
            msg.edit(`Latency is ${Date.now() - message.createdTimestamp}ms. API Latency is ${Math.round(bot.ws.ping)}ms`)
            return;
        }, 1000);
    })
}

module.exports.help = {
    name:"ping"
}