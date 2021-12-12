const {Permissions} = require('discord.js');
const config = require('../../../config.json');

module.exports.run = async (bot, message, args) => {
    if(config.deleteModCommandsAfterUsage  == 'true') {
        message.delete();
    }

    if (!message.member.permissions.has(Permissions.FLAGS.BAN_MEMBERS)) return message.channel.send(`<@${message.author.id}> You dont have permission for this Command!`);

    message.channel.send('Under construction');
}

module.exports.help = {
    name:"ban"
}