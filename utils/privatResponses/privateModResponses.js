const { MessageEmbed } = require("discord.js");
const { generateModEmote } = require("../functions/generateModEmote");
const config = require('../../src/assets/json/_config/config.json');

async function privateModResponse(member, type, reason, time, bot, guildname) {
    var privateModMessage = new MessageEmbed()
    .setTitle(`${await generateModEmote(config, bot, type)} **You got ${type} from ${guildname}!**`)
    .addField(`Reason`, `${reason || "No Reason Provided!"}`)
    .setTimestamp();
    if(time) {
        privateModMessage.addField(`Time`, `**${time}** `);
    }

    return member.send({embeds: [privateModMessage]}).catch(err => {
        // MEMBER HAS DM CLOSED
        return false;
    }).catch(err => {});
}

module.exports = {privateModResponse}