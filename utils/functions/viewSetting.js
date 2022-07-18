const { EmbedBuilder } = require("discord.js");
const { getEmote } = require("./getEmote");

async function viewSetting(bot, message, sett_name, sett_desc, sett_icon, current, sett_exp) {
    let emote = await getEmote(bot, sett_icon);
    let settingMessage = new EmbedBuilder()
        .setTitle(`**Settings for ${message.guild.name}**`)
        .setDescription(`**Change or view Settings**`)
        .addFields([
            {name: `${emote} - ${sett_name}`, value: `${sett_desc} \n Current Setting: **${current ?? 'Not set yet'}** \n ${sett_exp}`}
        ])
        .setTimestamp();

        return settingMessage;
}

module.exports = {viewSetting}