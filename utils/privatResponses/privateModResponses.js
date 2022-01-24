const { MessageEmbed } = require("discord.js");
const { generateModEmote } = require("../functions/generateModEmote");
const config = require('../../config.json');

async function privateModResponse(member, type, reason, time, bot) {
    var privateModMessage = new MessageEmbed()
    .setTitle(`${await generateModEmote(config, bot, type)} **You got ${type}!**`)
    .addField(`Reason`, `${reason || "No Reason Provided!"}`)
    .setTimestamp();
    if(time) {
        privateModMessage.addField(`Time`, `**${time}** `);
    }

    return member.send({embeds: [privateModMessage]}).catch(err => {
        /** MEMBER HAS DM CLOSED */
        return false;
    });
}

module.exports = {privateModResponse}