const { EmbedBuilder } = require('discord.js');
const {
    sendWelcomeSetting,
    updateWelcomeSettings,
} = require('../../../utils/functions/data/welcomechannel');
const { welcomeSettingsConfig, welcomeSettingsPerms } = require('../_config/admin/welcome');

module.exports.run = async ({ main_interaction }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

    const subcommand = main_interaction.options.getSubcommand();

    if (subcommand === 'add') {
        await updateWelcomeSettings({
            guild_id: main_interaction.guild.id,
            valueName: 'id',
            value: main_interaction.options.getChannel('channel').id,
        })
            .then(() => {
                sendWelcomeSetting({
                    main_interaction,
                });
            })
            .catch((err) => {
                main_interaction
                    .followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(
                                        ['error.generalWithMessage', err.message],
                                        main_interaction.guild.id
                                    )
                                )
                                .setColor(global.t.trans(['general.colors.success'])),
                        ],
                        ephemeral: true,
                    })
                    .catch(() => {});
            });
    } else if (subcommand === 'remove') {
        await updateWelcomeSettings({
            guild_id: main_interaction.guild.id,
            remove: true,
        })
            .then(() => {
                main_interaction
                    .followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(
                                        ['success.emote.admin.welcome.removed'],
                                        main_interaction.guild.id
                                    )
                                )
                                .setColor(global.t.trans(['general.colors.success'])),
                        ],
                    })
                    .catch(() => {});
            })
            .catch((err) => {
                main_interaction
                    .followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(
                                        ['error.generalWithMessage', err.message],
                                        main_interaction.guild.id
                                    )
                                )
                                .setColor(global.t.trans(['general.colors.success'])),
                        ],
                        ephemeral: true,
                    })
                    .catch(() => {});
            });
    }
};

module.exports.data = welcomeSettingsConfig;
module.exports.permissions = welcomeSettingsPerms;
