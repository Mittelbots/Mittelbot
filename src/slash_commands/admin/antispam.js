const { EmbedBuilder } = require('discord.js');
const { Automod } = require('../../../utils/functions/data/Automod');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const { antiSpamConfig, antiSpamPerms } = require('../_config/admin/antispam');

module.exports.run = async ({ main_interaction, bot }) => {
    let setting = await Automod.get(main_interaction.guild.id, 'antispam');

    const antiSpamEnabled = JSON.parse(main_interaction.options.getString('enabled'));
    const antiSpamAction = main_interaction.options.getString('action');

    setting.action = main_interaction.options.getString('action');

    if (!setting) {
        setting = {
            enabled: antiSpamEnabled,
            action: antiSpamAction,
        };
    }

    setting.enabled = antiSpamEnabled;
    setting.action = antiSpamAction;
    
    Automod.update({
        guild_id: main_interaction.guild.id,
        value: setting,
        type: 'antispam',
    })
        .then(() => {
            errorhandler({
                fatal: false,
                message: `${main_interaction.guild.id} has been updated the antispam config.`,
            });

            const description = setting.enabled
                ? global.t.trans(
                      ['success.automod.antispam.enabled', setting.action],
                      main_interaction.guild.id
                  )
                : global.t.trans(['success.automod.antispam.disabled'], main_interaction.guild.id);

            main_interaction
                .reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(description)
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
                            .setDescription(
                                global.t.trans(
                                    ['error.generalWithMessage', err.message],
                                    main_interaction.guild.id
                                )
                            )
                            .setColor(global.t.trans(['general.colors.error'])),
                    ],
                    ephemeral: true,
                })
                .catch((err) => {});
        });
};

module.exports.data = antiSpamConfig;
module.exports.permissions = antiSpamPerms;
