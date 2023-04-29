const { SlashCommandBuilder } = require('discord.js');

module.exports.warnConfig = new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn an user from the server')
    .addUserOption((option) =>
        option.setName('user').setDescription('The user to ban').setRequired(true)
    )
    .addStringOption((option) =>
        option.setName('reason').setDescription('The reason for the warn').setRequired(true)
    );

module.exports.warnPerms = {
    adminOnly: false,
    modOnly: false,
    guildOwnerOnly: false,
    requirePerms: [],
    botOwnerOnly: false,
};
