const { EmbedBuilder } = require("discord.js");
const { generateModEmote } = require("../functions/generateModEmote");

async function privateModResponse(member, type, reason, time, bot, guildname) {
<<<<<<< HEAD
    const privateModMessage = new EmbedBuilder()
        .setTitle(`${await generateModEmote({ bot, type })} **You got ${type} from ${guildname}!**`)
        .addFields([{ name: `Reason`, value: `${reason || 'No Reason Provided!'}` }])
        .setTimestamp();
    if (time) {
        privateModMessage.addFields([{ name: `Time`, value: `**${time}** ` }]);
=======
    if(member.id) {
        var privateModMessage = new EmbedBuilder()
        .setTitle(`${await generateModEmote({bot, type})} **You got ${type} from ${guildname}!**`)
        .addFields([{name: `Reason`, value: `${reason || "No Reason Provided!"}`}])
        .setTimestamp();
        if(time) {
            privateModMessage.addFields([{name: `Time`, value: `**${time}** `}]);
        }

        return member.send({embeds: [privateModMessage]}).catch(err => {
            // MEMBER HAS DM CLOSED
            return false;
        }).catch(err => {});
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f
    }

    return member
        .send({ embeds: [privateModMessage] })
        .catch((err) => {
            // MEMBER HAS DM CLOSED
            return false;
        })
        .catch((err) => {});
    return false;
}

module.exports = {privateModResponse}