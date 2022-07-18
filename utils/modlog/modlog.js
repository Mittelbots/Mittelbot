const {EmbedBuilder} = require('discord.js');
const database = require('../../src/db/db');
const { errorhandler } = require('../functions/errorhandler/errorhandler');
const { generateModEmote } = require('../functions/generateModEmote');
const {
    getFromCache,
} = require('../functions/cache/cache');

async function setNewModLogMessage(bot, type, moderator, member, reason, time, gid) {
    var modLogMessage = new EmbedBuilder()
    .setTitle(`${await generateModEmote({bot, type})} **Member ${type}!**`)
    .addFields([
        {name: `Moderator`, value: `${(moderator) ? '<@'+moderator+`> (${moderator})` : 'Auto Message'}`},
        {name: `${type.charAt(0).toUpperCase() + type.slice(1)} Member`, value: `${(member.username) ? `Username: **${member.username}**\n` : ''}Tag:<@${member.id || member}>\nUser ID: **(${member.id || member})**`},
        {name: `Reason`, value: `${reason || "No Reason Provided!"}`}
    ])
    .setTimestamp();

    if(time) {
        modLogMessage.addFields([{name: `Time`, value: `**${time}** `}])
    }

    await sendToModLog(bot, modLogMessage, gid);
    return;
}

async function sendToModLog(bot, message, gid) {
    const cache = await getFromCache({
        cacheName: "logs",
        param_id: gid
    });

    if(cache && cache[0].modlog) {
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