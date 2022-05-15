const {MessageEmbed} = require('discord.js');
const database = require('../../src/db/db');
const { errorhandler } = require('../functions/errorhandler/errorhandler');
const { generateModEmote } = require('../functions/generateModEmote');

async function setNewModLogMessage(bot, type, moderator, member, reason, time, gid) {
    var modLogMessage = new MessageEmbed()
    .setTitle(`${await generateModEmote({bot, type})} **Member ${type}!**`)
    .addField(`Moderator`, `<@${moderator}> (${moderator})`)
    .addField(`${type.charAt(0).toUpperCase() + type.slice(1)} Member`, `${(member.username) ? `Username: **${member.username}**\n` : ''}Tag:<@${member.id || member}>\nUser ID: **(${member.id || member})**`)
    .addField(`Reason`, `${reason || "No Reason Provided!"}`)
    .setTimestamp();

    if(time) {
        modLogMessage.addField(`Time`, `**${time}** `)
    }

    sendToModLog(bot, modLogMessage, gid);
    return;
}

function sendToModLog(bot, message, gid) {
    database.query(`SELECT modlog FROM ${gid}_guild_logs`).then(res => {
        if(res.length > 0 && res[0].modlog) {
            bot.channels.cache.get(res[0].modlog).send({embeds: [message]}).catch(err => {});
        }
    }).catch(err => {
        return errorhandler({err, fatal: true});
    })
    return;
}


module.exports = {setNewModLogMessage}