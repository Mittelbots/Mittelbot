const { EmbedBuilder } = require('discord.js');
const { generateModEmote } = require('../generateModEmote');

module.exports.privateModResponse = ({ member, type, reason, time = null, bot, guildname }) => {
    return new Promise(async (resolve) => {
        const privateModMessage = new EmbedBuilder()
            .setTitle(
                `${await generateModEmote({ bot, type })} **You got ${type} from ${guildname}!**`
            )
            .addFields([{ name: `Reason`, value: `${reason || 'No Reason Provided!'}` }])
            .setTimestamp();
        if (time) {
            privateModMessage.addFields([{ name: `Time`, value: `**${time}** ` }]);
        }

        if (typeof member !== 'object') member = await bot.users.fetch(member).catch((err) => {});
        if (!member) return resolve(false);

        return member
            .send({ embeds: [privateModMessage] })
            .then(() => {
                return resolve(true);
            })
            .catch((err) => {
                // MEMBER HAS DM CLOSED
                return resolve(false);
            });
    });
};
