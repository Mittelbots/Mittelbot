const { EmbedBuilder } = require('discord.js');
const { oldestmemberConfig } = require('../_config/utils/oldestmember');

module.exports.run = async ({ main_interaction, bot }) => {
    const includeBots = main_interaction.options.getBoolean('bots') || false;

    const oldestMember = main_interaction.guild.members.cache
        .filter((member) => {
            if (includeBots) {
                return true;
            } else {
                return !member.user.bot;
            }
        })
        .sort((a, b) => a.user.createdAt - b.user.createdAt)
        .first();

    const username = oldestMember.user.username;
    const createdAtRaw = new Date(oldestMember.user.createdAt);
    const joinedAtRaw = new Date(oldestMember.joinedAt);

    timeDifference = (date) => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();

        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        const months = Math.floor(days / 30);
        const years = Math.floor(months / 12);

        const remainingMonths = months % 12;
        const remainingDays = days % 30;
        const remainingHours = hours % 24;

        return {
            years,
            remainingMonths,
            remainingDays,
            remainingHours,
        };
    };

    generateDifferenceString = (timeDiff) => {
        let string = '';

        switch (true) {
            case timeDiff.years > 0:
                string += `${timeDiff.years} Years `;

            case timeDiff.remainingMonths:
                string += `${timeDiff.remainingMonths} Months `;

            case timeDiff.remainingDays:
                string += `${timeDiff.remainingDays} Days `;

            case timeDiff.remainingHours:
                string += `${timeDiff.remainingHours} Hours`;
        }

        return string;
    };

    const createdAt = generateDifferenceString(timeDifference(createdAtRaw));
    const joinedAt = generateDifferenceString(timeDifference(joinedAtRaw));

    return main_interaction.reply({
        embeds: [
            new EmbedBuilder()
                .setDescription(
                    global.t.trans(
                        ['info.utils.oldestmember', username, joinedAt, createdAt],
                        main_interaction.guild.id
                    )
                )
                .setColor(global.t.trans(['general.colors.info'])),
        ],
        ephemeral: true,
    });
};

module.exports.data = oldestmemberConfig;
