const { Joinroles } = require('../../../utils/functions/data/Joinroles');
const { removeMention } = require('../../../utils/functions/removeCharacters');
const { joinrolesConfig } = require('../_config/admin/joinroles');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({ ephemeral: true }).catch((err) => {});

    const hasPermissions = await hasPermission({
        guild_id: main_interaction.guild.id,
        adminOnly: true,
        modOnly: false,
        user: main_interaction.user,
        bot,
    });

    if (!hasPermissions) {
        main_interaction
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
            .catch(() => {});
        return;
    }

    const roles = main_interaction.options.getString('joinroles');
    const newJoinRoles = removeMention(roles).split(' ');
    Joinroles.update({
        guild: main_interaction.guild,
        roles: newJoinRoles,
        user: bot.guilds.cache
            .get(main_interaction.guild.id)
            .members.cache.get(main_interaction.user.id),
    })
        .then((res) => {
            main_interaction
                .followUp({
                    content: `✅ ${res}`,
                    ephemeral: true,
                })
                .catch((err) => {});
        })
        .catch((err) => {
            main_interaction
                .followUp({
                    content: `❌ ${err}`,
                    ephemeral: true,
                })
                .catch((err) => {});
        });
};

module.exports.data = joinrolesConfig;
