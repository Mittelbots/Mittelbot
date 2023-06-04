const { EmbedBuilder } = require('discord.js');
const {
    sendWelcomeSetting,
    updateWelcomeSettings,
} = require('~utils/functions/data/welcomechannel');
const { welcomeSettingsConfig, welcomeSettingsPerms } = require('../_config/admin/welcome');

module.exports.run = async ({ main_interaction }) => {
    await main_interaction.deferReply({ ephemeral: true });

    const subcommand = main_interaction.options.getSubcommand();

    try {
        if (subcommand === 'add') {
            const channelId = main_interaction.options.getChannel('channel').id;
            await updateWelcomeSettings({
                guild_id: main_interaction.guild.id,
                valueName: 'id',
                value: channelId,
            });
            sendWelcomeSetting({ main_interaction });
        } else if (subcommand === 'status') {
            const status = main_interaction.options.getBoolean('status');
            await updateWelcomeSettings({
                guild_id: main_interaction.guild.id,
                valueName: 'active',
                value: status,
            });
            const descriptionTrans = status
                ? 'success.admin.welcome.statusActivated'
                : 'success.admin.welcome.statusDeactivated';
            main_interaction.followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans([descriptionTrans], main_interaction.guild.id)
                        )
                        .setColor(global.t.trans(['general.colors.success'])),
                ],
            });
        } else if (subcommand === 'remove') {
            await updateWelcomeSettings({ guild_id: main_interaction.guild.id, remove: true });
            main_interaction.followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['success.admin.welcome.removed'],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.success'])),
                ],
            });
        }
    } catch (err) {
        const description = global.t.trans(
            ['error.generalWithMessage', err.message],
            main_interaction.guild.id
        );
        const color = global.t.trans(['general.colors.success']);
        const ephemeral = subcommand === 'add' ? true : false;

        main_interaction
            .followUp({
                embeds: [new EmbedBuilder().setDescription(description).setColor(color)],
                ephemeral: ephemeral,
            })
            .catch(() => {});
    }
};

module.exports.data = welcomeSettingsConfig;
module.exports.permissions = welcomeSettingsPerms;
