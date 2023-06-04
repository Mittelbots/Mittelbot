const config = require('~assets/json/_config/config.json');
const GuildConfig = require('~utils/classes/Config');
const { autoTranslateConfig, autotranslatePerms } = require('../_config/admin/autotranslate');
const { EmbedBuilder } = require('discord.js');

module.exports.run = async ({ main_interaction, bot }) => {
    const translate_language = main_interaction.options.getString('language');
    const translate_target = main_interaction.options.getChannel('target').id;
    const translate_log_channel = main_interaction.options.getChannel('log').id;

    const newTranslateConfig = {
        mode: 'enable',
        translate_language,
        translate_target,
        translate_log_channel,
    };

    new GuildConfig()
        .update({
            guild_id: main_interaction.guild.id,
            value: newTranslateConfig,
            valueName: 'translate',
        })
        .then(() => {
            return main_interaction
                .reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(
                                    ['success.admin.autotranslate.update'],
                                    main_interaction.guild.id
                                )
                            )
                            .setColor(global.t.trans(['general.colors.success'])),
                    ],
                    ephemeral: true,
                })
                .catch((err) => {});
        })
        .catch(() => {
            return main_interaction
                .reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(['error.general'], main_interaction.guild.id)
                            )
                            .setColor(global.t.trans(['general.colors.error'])),
                    ],
                    ephemeral: true,
                })
                .catch((err) => {});
        });
};

module.exports.data = autoTranslateConfig;
module.exports.permissions = autotranslatePerms;
