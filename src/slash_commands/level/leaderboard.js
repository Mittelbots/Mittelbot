const { SlashCommandBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { Levelsystem } = require('../../../utils/functions/data/levelsystemAPI');
const { leaderboardConfig } = require('../_config/level/leaderboard');
module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

    const leaderboard = await Levelsystem.getRank({
        guild_id: main_interaction.guild.id,
    });

    const guild = bot.guilds.cache.get(main_interaction.guild.id);
    const lb_embed = new EmbedBuilder()
        .setTitle(`Top 10 members of ${guild.name}'s leaderboard.`)
        .setColor(global.t.trans(['general.colors.success']))
        .setTimestamp();

    let isInTopTen = false;
    let userRank;
    let userXP;
    let userLevel;

    if (leaderboard.length === 0) {
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['error.leaderboard.noOneRanked'],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
            })
            .catch((err) => {});
    }
    2;
    for (let i in leaderboard) {
        if (leaderboard[i][0] === main_interaction.user.id) {
            if (i <= 10) {
                isInTopTen = true;
            }
            userRank = Number(i) + 1;
            userXP = leaderboard[i][1];
            userLevel = Number(leaderboard[i][2]) + 1;
        }
        if (i >= 10) continue;
        lb_embed.addFields([
            {
                name: `Rank: ${Number(i) + 1}`,
                value: `<@${leaderboard[i][0]}>\n**XP:** \`${
                    leaderboard[i][1]
                }\` - **Level:** \`${Number(leaderboard[i][2])}\` - **Messages:** \`${
                    leaderboard[i][3]
                }\` `,
            },
        ]);
    }

    if (!isInTopTen) {
        if (userRank && userXP && userLevel) {
            lb_embed.addFields([
                {
                    name: global.t.trans(
                        ['info.leaderboard.currentRank'],
                        main_interaction.guild.id
                    ),
                    value: global.t.trans(
                        ['info.leaderboard.XP_Level', userXP, userLevel],
                        main_interaction.guild.id
                    ),
                },
            ]);
        } else {
            lb_embed.addFields([
                {
                    name: global.t.trans(
                        ['info.leaderboard.notRanksYet'],
                        main_interaction.guild.id
                    ),
                    value: global.t.trans(
                        ['info.leaderboard.writeAMessageFirst'],
                        main_interaction.guild.id
                    ),
                },
            ]);
        }
    }

    return main_interaction
        .followUp({
            embeds: [lb_embed],
        })
        .catch((err) => {});
};

module.exports.data = leaderboardConfig;
