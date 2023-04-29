const { PermissionFlagsBits } = require('discord.js');
const {
    sendWelcomeSetting,
    updateWelcomeSettings,
} = require('../../../utils/functions/data/welcomechannel');
const { GuildConfig } = require('../../../utils/functions/data/Config');
const config = require('../../../src/assets/json/_config/config.json');
const { EmbedBuilder } = require('discord.js');
const { settingsConfig, settingsPerms } = require('../_config/admin/settings');
module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

    switch (main_interaction.options.getSubcommand()) {
        case 'view':
            return main_interaction
                .reply({
                    content: 'This command is currenty disabled',
                    ephemeral: true,
                })
                .catch((err) => {});
            break;

        case 'welcomemessage':
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
                            content: '❌ ' + err,
                            ephemeral: true,
                        })
                        .catch((err) => {});
                });
            break;

        case 'cooldown':
            const cooldown = main_interaction.options.getNumber('cooldown');
            if (cooldown <= 2) {
                await saveSetting({
                    value: 0,
                    valueName: 'cooldown',
                });
                main_interaction
                    .followUp({
                        content: ``,
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(
                                        ['success.settings.cooldown.disabled'],
                                        main_interaction.guild.id
                                    )
                                )
                                .setColor(global.t.trans(['general.colors.success'])),
                        ],
                        ephemeral: true,
                    })
                    .catch((err) => {});
            } else {
                await saveSetting({
                    value: cooldown * 1000,
                    valueName: 'cooldown',
                });
                main_interaction
                    .followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(
                                        ['success.settings.cooldown.set', cooldown],
                                        main_interaction.guild.id
                                    )
                                )
                                .setColor(global.t.trans(['general.colors.success'])),
                        ],
                        ephemeral: true,
                    })
                    .catch((err) => {});
            }
            break;
    }

    async function saveSetting({ value, valueName }) {
        await GuildConfig.update({
            guild_id: main_interaction.guild.id,
            value,
            valueName,
        });
    }
};

module.exports.data = settingsConfig;
module.exports.permissions = settingsPerms;
