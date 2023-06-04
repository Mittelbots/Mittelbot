const { EmbedBuilder } = require('discord.js');
const { oldestmemberConfig } = require('../_config/utils/oldestmember');
const { remainingTime, remainingTimeString } = require('~utils/functions/getTimeDifference');

module.exports.run = async ({ main_interaction, bot }) => {
    const includeBots = main_interaction.options.getBoolean('bots') || false;

    const oldestMember = main_interaction.guild.members.cache
        .filter((member) => {
            if (member.id === main_interaction.guild.ownerId) {
                return false;
            }

            return includeBots ? true : !member.user.bot;
        })
        .sort((a, b) => a.user.createdAt - b.user.createdAt)
        .first();

    const username = oldestMember.user.username;
    const createdAtRaw = new Date(oldestMember.user.createdAt);
    const joinedAtRaw = new Date(oldestMember.joinedAt);

    const createdAt = remainingTimeString(remainingTime(createdAtRaw));
    const joinedAt = remainingTimeString(remainingTime(joinedAtRaw));

    return main_interaction
        .reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        global.t.trans(
                            ['info.utils.oldestOrNewestmember', username, joinedAt, createdAt],
                            main_interaction.guild.id
                        )
                    )
                    .setColor(global.t.trans(['general.colors.info'])),
            ],
            ephemeral: true,
        })
        .catch(() => {});
};

module.exports.data = oldestmemberConfig;
