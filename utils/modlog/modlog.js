const {MessageEmbed} = require('discord.js');
const config = require('../../config.json');

async function setNewModLogMessage(bot, type, moderator, member, reason, time) {
    var modLogMessage = new MessageEmbed()
    .setTitle(`**Member ${type}!**`)
    .addField(`Moderator`, `<@${moderator}> (${moderator})`)
    .addField(`${type} Member`, `<@${member}> (${member})`)
    .addField(`Reason`, `${reason || "No Reason Provided!"}`)
    .setTimestamp();

    if(time) {
        modLogMessage.addField(`Time`, `**${time}** `)
    }

    sendToModLog(bot, modLogMessage);
    return;
}

function sendToModLog(bot, message) {
    try {
        bot.channels.cache.get(config.defaultChannels.modlog).send({embeds: [message]});
        console.log('1')
    }catch(err) {
        console.log(err)
    }
}


module.exports = {setNewModLogMessage}