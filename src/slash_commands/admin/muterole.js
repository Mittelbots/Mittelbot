const { PermissionFlagsBits } = require('discord.js');
const { muteRoleConfig, muterolePerms } = require('../_config/admin/muterole');
const GuildConfig = require('~utils/classes/Config');
const { EmbedBuilder } = require('discord.js');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({ ephemeral: true });

    const role = main_interaction.options.getRole('role');

    switch (main_interaction.options.getSubcommand()) {
        case 'set':
            await new GuildConfig()
                .update({
                    guild_id: main_interaction.guild.id,
                    valueName: 'muterole',
                    value: role.id,
                })
                .then(() => {
                    return main_interaction
                        .followUp({
                            embeds: [
                                new EmbedBuilder()
                                    .setDescription(
                                        global.t.trans(
                                            ['success.admin.settings.muteRole.set', role],
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
                    return main_interaction
                        .followUp({
                            embeds: [
                                new EmbedBuilder()
                                    .setDescription(
                                        global.t.trans(
                                            ['error.settings.muteRole.set'],
                                            main_interaction.guild.id
                                        )
                                    )
                                    .setColor(global.t.trans(['general.colors.error'])),
                            ],
                            ephemeral: true,
                        })
                        .catch((err) => {});
                });
            break;

        case 'remove':
            await new GuildConfig()
                .update({
                    guild_id: main_interaction.guild.id,
                    valueName: 'muterole',
                    value: null,
                })
                .then(() => {
                    return main_interaction
                        .followUp({
                            embeds: [
                                new EmbedBuilder()
                                    .setDescription(
                                        global.t.trans(
                                            ['success.admin.settings.muteRole.remove'],
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
                    return main_interaction
                        .followUp({
                            embeds: [
                                new EmbedBuilder()
                                    .setDescription(
                                        global.t.trans(
                                            ['error.settings.muteRole.remove'],
                                            main_interaction.guild.id
                                        )
                                    )
                                    .setColor(global.t.trans(['general.colors.error'])),
                            ],
                            ephemeral: true,
                        })
                        .catch((err) => {});
                });
            break;
    }
};

module.exports.data = muteRoleConfig;
module.exports.permissions = muterolePerms;
