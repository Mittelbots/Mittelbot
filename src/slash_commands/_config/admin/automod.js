const { SlashCommandBuilder } = require('discord.js');

module.exports.autoModConfig = new SlashCommandBuilder()
    .setName('automod')
    .setDescription('All settings related to automoderation.')

    .addSubcommand((command) =>
        command
            .setName('whitelistroles')
            .setDescription(
                "Configure global whitelist role which wont't be effected by the automod."
            )
            .addRoleOption((option) =>
                option.setName('role').setDescription('Enable/disable anti-spam.').setRequired(true)
            )
            .addBooleanOption((option) =>
                option
                    .setName('remove')
                    .setDescription('Select if you want to remove the role from the whitelist.')
                    .setRequired(false)
            )
    );

module.exports.automodPerms = {
    adminOnly: true,
    modOnly: false,
    guildOwnerOnly: false,
    requirePerms: [],
    botOwnerOnly: false,
};
