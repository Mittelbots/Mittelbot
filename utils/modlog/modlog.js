const {MessageEmbed} = require('discord.js');
const {Database} = require('../../src/db/db');

const database = new Database();

async function setNewModLogMessage(bot, type, moderator, member, reason, time, gid) {
    var modLogMessage = new MessageEmbed()
    .setTitle(`**Member ${type}!**`)
    .addField(`Moderator`, `<@${moderator}> (${moderator})`)
    .addField(`${type} Member`, `<@${member}> (${member})`)
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
        if(res.length > 0) {
            try {
                bot.channels.cache.get(res[0].modlog).send({embeds: [message]});
            }catch(err) {
                console.log(err)
            }
        }
    }).catch(err => console.log(err));
}


module.exports = {setNewModLogMessage}