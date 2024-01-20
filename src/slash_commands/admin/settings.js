const GuildConfig = require('~utils/classes/Config');
const { EmbedBuilder } = require('discord.js');
const { settingsConfig, settingsPerms } = require('../_config/admin/settings');
module.exports.run = async ({ main_interaction }) => {
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
                .catch(() => {});

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
                                        ['success.admin.settings.cooldown.disabled'],
                                        main_interaction.guild.id
                                    )
                                )
                                .setColor(global.t.trans(['general.colors.success'])),
                        ],
                        ephemeral: true,
                    })
                    .catch(() => {});
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
                                        ['success.admin.settings.cooldown.set', cooldown],
                                        main_interaction.guild.id
                                    )
                                )
                                .setColor(global.t.trans(['general.colors.success'])),
                        ],
                        ephemeral: true,
                    })
                    .catch(() => {});
            }
            break;
    }

    async function saveSetting({ value, valueName }) {
        await new GuildConfig().update({
            guild_id: main_interaction.guild.id,
            value,
            valueName,
        });
    }
};

module.exports.data = settingsConfig;
module.exports.permissions = settingsPerms;
