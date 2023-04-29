const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports.muteRoleConfig = new SlashCommandBuilder()
    .setName('muterole')
    .setDescription('Add your custom mute role for your server.')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('set')
            .setDescription('Set the mute role for your server.')
            .addRoleOption((option) =>
                option
                    .setName('role')
                    .setDescription('The role to set as the mute role.')
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand.setName('remove').setDescription('Remove the mute role from your server.')
    );

module.exports.muterolePerms = {
    adminOnly: false,
    modOnly: false,
    guildOwnerOnly: false,
    requirePerms: [PermissionFlagsBits.Administrator],
    botOwnerOnly: false,
};
