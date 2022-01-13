const { MessageEmbed } = require("discord.js");
async function privateModResponse(member, type, reason, time) {
    try {
        var privateModMessage = new MessageEmbed()
        .setTitle(`**You got ${type}!**`)
        .addField(`Reason`, `${reason || "No Reason Provided!"}`)
        .setTimestamp();

        if(time) {
            privateModMessage.addField(`Time`, `**${time}** `);
        }

        member.send({embeds: [privateModMessage]});
        return;
    }catch(err) {
        //DM'S ARE NO OPEN OR THE USER BLOCKED THE BOT
        return;
    }
}

module.exports = {privateModResponse}