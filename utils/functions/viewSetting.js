const { MessageEmbed } = require("discord.js");
const { getEmote } = require("./getEmote");

async function viewSetting(bot, message, sett_name, sett_desc, sett_icon, current, sett_exp) {
    let emote = await getEmote(bot, sett_icon);
    let settingMessage = new MessageEmbed()
        .setTitle(`**Settings for ${message.guild.name}**`)
        .setDescription(`**Change or view Settings**`)
        .addField(`${emote} - ${sett_name}`, `${sett_desc} \n Current Setting: **${current ?? 'Not set yet'}** \n ${sett_exp}`)
        .setTimestamp();

        return settingMessage;
}

module.exports = {viewSetting}