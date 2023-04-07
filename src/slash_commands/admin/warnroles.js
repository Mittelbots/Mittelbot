const { EmbedBuilder } = require('discord.js');
const { Warnroles } = require('../../../utils/functions/data/Warnroles');
const { removeMention } = require('../../../utils/functions/removeCharacters');
const { warnRolesConfig } = require('../_config/admin/warnroles');
const { hasPermission } = require('../../../utils/functions/hasPermissions');

module.exports.run = async ({ main_interaction, bot }) => {
    const hasPermissions = await hasPermission({
        guild_id: main_interaction.guild.id,
        adminOnly: true,
        modOnly: false,
        user: main_interaction.user,
        bot,
    });

    if (!hasPermissions) {
        main_interaction
            .reply({
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

    const warnroles = removeMention(main_interaction.options.getString('warnroles')).split(' ');
    await Warnroles.update({
        guild: main_interaction.guild,
        roles: warnroles,
        user: bot.guilds.cache
            .get(main_interaction.guild.id)
            .members.cache.get(main_interaction.user.id),
    })
        .then(() => {
            main_interaction
                .reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(
                                    ['success.warnroles.update', cooldown],
                                    main_interaction.guild.id
                                )
                            )
                            .setColor(global.t.trans(['general.colors.success'])),
                    ],
                    ephemeral: true,
                })
                .catch((err) => {});
        })
        .catch((err) => {
            main_interaction
                .reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(err)
                            .setColor(global.t.trans(['general.colors.error'])),
                    ],
                    ephemeral: true,
                })
                .catch((err) => {});
        });
};

module.exports.data = warnRolesConfig;
