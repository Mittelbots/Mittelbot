const { SlashCommandBuilder } = require('discord.js');

const config = require('~assets/json/_config/config.json');

const { getModTime } = require('~utils/functions/getModTime');
const { hasPermission } = require('~utils/functions/hasPermissions');
const { banUser } = require('~utils/functions/moderations/banUser');
const { isBanned } = require('~utils/functions/moderations/checkOpenInfractions');
const { checkTarget } = require('~utils/functions/checkMessage/checkMessage');
const { banConfig, banPerms } = require('../_config/moderation/ban');
const { EmbedBuilder } = require('discord.js');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

    const user = main_interaction.options.getUser('user');

    const canIBanTheUser = await checkTarget({
        author: main_interaction.user,
        guild: main_interaction.guild,
        target: user,
        type: 'ban',
    }).catch((reason) => {
        main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(reason)
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            })
            .catch((err) => {});
    });
    if (!canIBanTheUser) return;

    const isUserAlreadyBanned = await isBanned(user, main_interaction.guild);
    if (isUserAlreadyBanned) {
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['error.moderation.ban.alreadyBanned'],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            })
            .catch((err) => {});
    }

    let time = main_interaction.options.getString('time');
    let dbtime = getModTime(time);
    if (!dbtime) {
        time = 'Permanent';
        dbtime = getModTime('99999d');
    }

    const reason = main_interaction.options.getString('reason') || 'No reason provided';

    await banUser({
        user,
        mod: main_interaction.user,
        guild: main_interaction.guild,
        reason,
        bot,
        dbtime,
        time,
    })
        .then((msg) => {
            main_interaction
                .followUp({
                    embeds: [msg.message],
                    ephemeral: true,
                })
                .catch((err) => {});
        })
        .catch((err) => {
            main_interaction
                .followUp({
                    content: err,
                    ephemeral: true,
                })
                .catch((err) => {});
        });
};

module.exports.data = banConfig;
module.exports.permissions = banPerms;
