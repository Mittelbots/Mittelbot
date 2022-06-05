const {MessageEmbed} = require('discord.js');
const database = require('../../src/db/db');
const { errorhandler } = require('../functions/errorhandler/errorhandler');
const { generateModEmote } = require('../functions/generateModEmote');
const {
    getFromCache,
} = require('../functions/cache/cache');

async function setNewModLogMessage(bot, type, moderator, member, reason, time, gid) {
    var modLogMessage = new MessageEmbed()
    .setTitle(`${await generateModEmote({bot, type})} **Member ${type}!**`)
    .addField(`Moderator`, `${(moderator) ? '<@'+moderator+`> (${moderator})` : 'Auto Message'}`)
    .addField(`${type.charAt(0).toUpperCase() + type.slice(1)} Member`, `${(member.username) ? `Username: **${member.username}**\n` : ''}Tag:<@${member.id || member}>\nUser ID: **(${member.id || member})**`)
    .addField(`Reason`, `${reason || "No Reason Provided!"}`)
    .setTimestamp();

    if(time) {
        modLogMessage.addField(`Time`, `**${time}** `)
    }

    await sendToModLog(bot, modLogMessage, gid);
    return;
}

async function sendToModLog(bot, message, gid) {
    const cache = await getFromCache({
        cacheName: "logs",
        param_id: gid
    });

    if(cache) {
        return bot.channels.cache.get(cache[0].modlog).send({embeds: [message]}).catch(err => {});
    }
    
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