const { checkTarget } = require('../../../utils/functions/checkMessage/checkMessage');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { getModTime } = require('../../../utils/functions/getModTime');
const { muteUser } = require('../../../utils/functions/moderations/muteUser');
const { isMuted } = require('../../../utils/functions/moderations/checkOpenInfractions');
const { muteConfig } = require('../_config/moderation/mute');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

    const hasPermissions = await hasPermission({
        guild_id: main_interaction.guild.id,
        adminOnly: false,
        modOnly: false,
        user: main_interaction.member,
        bot,
    });

    if (!hasPermissions) {
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['error.permissions.user.useCommand'],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            })
            .catch((err) => {});
    }

    const user = main_interaction.options.getUser('user');

    const canIMuteTheUser = await checkTarget({
        author: main_interaction.user,
        target: user,
        guild: main_interaction.guild,
        bot,
        type: 'mute',
    });
    if (!canIMuteTheUser)
        return main_interaction
            .followUp({
                content: check,
                ephemeral: true,
            })
            .catch((err) => {});

    const isUserMuted = await isMuted({ user, guild: main_interaction.guild, bot });
    if (isUserMuted) {
        return main_interaction
            .followUp({
                content: 'This user is already muted!',
                ephemeral: true,
            })
            .catch((err) => {});
    }

    var time = main_interaction.options.getString('time');

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
