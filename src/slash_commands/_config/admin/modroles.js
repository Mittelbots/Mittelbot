const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports.modRolesConfig = new SlashCommandBuilder()
    .setName('modroles')
    .setDescription('Add Modroles to be able to use the moderation commands')
    .addRoleOption((option) =>
        option
            .setName('roles')
            .setDescription('Add a role to be able to use the moderation commands')
            .setRequired(true)
    );

module.exports.modRolesPerms = {
    adminOnly: false,
    modOnly: false,
    guildOwnerOnly: false,
    requirePerms: [PermissionFlagsBits.Administrator],
    botOwnerOnly: false,
};
