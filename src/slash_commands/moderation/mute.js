const { checkTarget } = require('~utils/functions/checkMessage/checkMessage');
const { hasPermission } = require('~utils/functions/hasPermissions');
const { getModTime } = require('~utils/functions/getModTime');
const { muteUser } = require('~utils/functions/moderations/muteUser');
const { isMuted } = require('~utils/functions/moderations/checkOpenInfractions');
const { muteConfig, mutePerms } = require('../_config/moderation/mute');
const { EmbedBuilder } = require('discord.js');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

    const user = main_interaction.options.getUser('user');

    const canIMuteTheUser = await checkTarget({
        author: main_interaction.user,
        target: user,
        guild: main_interaction.guild,
        bot,
        type: 'mute',
    }).catch((err) => {
        main_interaction
            .followUp({
                content: err,
                ephemeral: true,
            })
            .catch((err) => {});
    });
    if (!canIMuteTheUser) return;

    const isUserMuted = await isMuted({ user, guild: main_interaction.guild, bot });
    if (isUserMuted) {
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['error.moderation.mute.alreadyMuted'],
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

    let reason = main_interaction.options.getString('reason') || 'No reason provided';

    await muteUser({
        user,
        mod: main_interaction.user,
        bot,
        guild: main_interaction.guild,
        reason,
        time,
        dbtime,
    })
        .then((res) => {
            return main_interaction
                .followUp({
                    embeds: [res.message],
                    ephemeral: true,
                })
                .catch((err) => {});
        })
        .catch((err) => {
            return main_interaction
                .followUp({
                    content: err,
                    ephemeral: true,
                })
                .catch((err) => {});
        });

    return;
};

module.exports.data = muteConfig;
module.exports.permissions = mutePerms;
