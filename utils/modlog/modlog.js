const { EmbedBuilder } = require('discord.js');
const { generateModEmote } = require('../functions/generateModEmote');
const { getLogs } = require('../functions/data/logs');

async function setNewModLogMessage(bot, type, moderator, member, reason, time, gid) {
    var modLogMessage = new EmbedBuilder()
        .setTitle(`${await generateModEmote({ bot, type })} **Member ${type}!**`)
        .addFields([
            {
                name: `Moderator`,
                value: `${moderator ? '<@' + moderator + `> (${moderator})` : 'Auto Message'}`,
            },
            {
                name: `${type.charAt(0).toUpperCase() + type.slice(1)} Member`,
                value: `${member.username ? `Username: **${member.username}**\n` : ''}Tag:<@${
                    member.id || member
                }>\nUser ID: **(${member.id || member})**`,
            },
            { name: `Reason`, value: `${reason || 'No Reason Provided!'}` },
        ])
        .setTimestamp();

    if (time) {
        modLogMessage.addFields([{ name: `Time`, value: `**${time}** ` }]);
    }

    await sendToModLog(bot, modLogMessage, gid);
    return;
}

async function sendToModLog(bot, message, gid) {
    const logs = await getLogs({
        guild_id: gid,
    });

    if (logs && logs.modlog) {
        await bot.channels.cache
            .get(logs.modlog)
            .send({ embeds: [message] })
            .catch((err) => {});
        return true;
    }
    return;
}

module.exports = { setNewModLogMessage };
