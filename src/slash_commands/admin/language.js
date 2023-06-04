const { languageConfig, languagePerms } = require('../_config/admin/language');
const GuildConfig = require('~utils/classes/Config');
const { EmbedBuilder } = require('discord.js');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({ ephemeral: true }).catch((err) => {});

    const language = main_interaction.options.getString('language');

    new GuildConfig()
        .update({
            guild_id: main_interaction.guild.id,
            value: language,
            valueName: 'lang',
        })
        .then(() => {
            global.t.updateCache(main_interaction.guild.id, language);
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
                            .setColor(global.t.trans(['general.colors.success'])),
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
module.exports.permissions = languagePerms;
