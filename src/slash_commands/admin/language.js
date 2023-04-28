const { languageConfig } = require('../_config/admin/language');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { GuildConfig } = require('../../../utils/functions/data/Config');
const { EmbedBuilder } = require('discord.js');

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

    const language = main_interaction.options.getString('language');

    GuildConfig.update({
        guild_id: main_interaction.guild.id,
        value: language,
        valueName: 'lang',
    })
        .then(() => {
            main_interaction
                .followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(
                                    ['success.admin.lang.set', language],
                                    main_interaction.guild.id
                                )
                            )
                            .setColor(global.t.trans(['general.colors.error'])),
                    ],
                    ephemeral: true,
                })
                .catch(() => {});
        })
        .catch((err) => {
            main_interaction
                .followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(['error.general'], main_interaction.guild.id)
                            )
                            .setColor(global.t.trans(['general.colors.error'])),
                    ],
                    ephemeral: true,
                })
                .catch(() => {});
        });
};

module.exports.data = languageConfig;
