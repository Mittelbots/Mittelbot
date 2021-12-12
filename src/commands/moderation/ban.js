const {Permissions} = require('discord.js');
const config = require('../../../config.json');

module.exports.run = async (bot, message, args) => {
    if(config.deleteModCommandsAfterUsage  == 'true') {
        message.delete();
    }

    var hasPermission = false
    for(let i in config.modroles) {
        if(i == "trialmoderator") continue;

        if(message.member.roles.cache.find(r => r.name === config.modroles[i]) !== undefined) {
            hasPermission = true;
            break;
        }
    }
    if(!hasPermission) {
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
    }
    message.channel.send('Under construction');
}

module.exports.help = {
    name:"ban"
}