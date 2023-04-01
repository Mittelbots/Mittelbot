const { hasPermission } = require('../../../utils/functions/hasPermissions');
const config = require('../../../src/assets/json/_config/config.json');
const { GuildConfig } = require('../../../utils/functions/data/Config');
const { autoTranslateConfig } = require('../_config/admin/autotranslate');
const { EmbedBuilder } = require('discord.js');

module.exports.run = async ({ main_interaction, bot }) => {
    const hasPermissions = await hasPermission({
        guild_id: main_interaction.guild.id,
        adminOnly: true,
        modOnly: false,
        user: main_interaction.member,
        bot,
    });
    if (!hasPermissions) {
        return main_interaction
            .reply({
                content: `${config.errormessages.nopermission}`,
                ephemeral: true,
            })
            .catch((err) => {});
    }

    const translate_language = main_interaction.options.getString('language');
    const translate_target = main_interaction.options.getChannel('target').id;
    const translate_log_channel = main_interaction.options.getChannel('log').id;

    const newTranslateConfig = {
        mode: 'enable',
        translate_language,
        translate_target,
        translate_log_channel,
    };

    GuildConfig.update({
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
                                    ['success.autotranslate.update'],
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
