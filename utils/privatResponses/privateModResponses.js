const { MessageEmbed } = require("discord.js");
const { generateModEmote } = require("../functions/generateModEmote");

async function privateModResponse(member, type, reason, time, bot, guildname) {
    if(member.id) {
        var privateModMessage = new MessageEmbed()
        .setTitle(`${await generateModEmote({bot, type})} **You got ${type} from ${guildname}!**`)
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
    return false;
}

module.exports = {privateModResponse}