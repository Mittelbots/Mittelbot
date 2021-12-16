const { MessageEmbed } = require("discord.js");
async function privateModResponse(member, type, reason, time) {
    var privateModMessage = new MessageEmbed()
    .setTitle(`**You got ${type}!**`)
    .addField(`Reason`, `${reason || "No Reason Provided!"}`)
    .setTimestamp();

    if(time) {
        privateModMessage.addField(`Time`, `**${time}** `);
    }

    member.send({embeds: [privateModMessage]});
    return;
}

module.exports = {privateModResponse}