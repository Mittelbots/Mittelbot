const {MessageEmbed} = require('discord.js');
const config = require('../../src/assets/json/_config/config.json');
const { generateModEmote } = require('../functions/generateModEmote');

async function setNewModLogMessage(bot, type, moderator, member, reason, time, gid, database) {

    var modLogMessage = new MessageEmbed()
    .setTitle(`${await generateModEmote(config, bot, type)} **Member ${type}!**`)
    .addField(`Moderator`, `<@${moderator}> (${moderator})`)
    .addField(`${type} Member`, `<@${member}> (${member})`)
    .addField(`Reason`, `${reason || "No Reason Provided!"}`)
    .setTimestamp();

    if(time) {
        modLogMessage.addField(`Time`, `**${time}** `)
    }

    sendToModLog(bot, modLogMessage, gid, database);
    return;
}

function sendToModLog(bot, message, gid, database) {
    database.query(`SELECT modlog FROM ${gid}_guild_logs`).then(res => {
        if(res.length > 0 && res[0].modlog) {
            try {
                bot.channels.cache.get(res[0].modlog).send({embeds: [message]});
            }catch(err) {
                console.log(err)
                return true;
            }
        }
    }).catch(err => console.log(err))
    return;
}


module.exports = {setNewModLogMessage}