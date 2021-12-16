const { MessageEmbed } = require("discord.js");

async function publicModResponses(channelmessage, type, moderator, member, reason, time) {
    var publicModMessage = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle(`**Member ${type}!**`)
    .addField(`Moderator`, `<@${moderator}> (${moderator})`)
    .addField(`Member`, `<@${member}> (${member})`)
    .addField(`Reason`, `${reason || "No Reason Provided!"}`)
    .setTimestamp();

    if(time) {
        publicModMessage.addField(`Time`, `**${time}** `)
    }

    channelmessage.channel.send({embeds: [publicModMessage]});
    return;
}

module.exports = {publicModResponses}