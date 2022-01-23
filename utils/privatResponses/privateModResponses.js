const { MessageEmbed } = require("discord.js");
const { generateModEmote } = require("../functions/generateModEmote");
const config = require('../../config.json');

async function privateModResponse(member, type, reason, time, bot) {
    try {
        var privateModMessage = new MessageEmbed()
        .setTitle(`${await generateModEmote(config, bot, type)} **You got ${type}!**`)
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