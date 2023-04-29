const { SlashCommandBuilder } = require('discord.js');

module.exports.banConfig = new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server')
    .addUserOption((option) =>
        option.setName('user').setDescription('The user to ban').setRequired(true)
    )
    .addStringOption((option) =>
        option.setName('time').setDescription('The time to ban the user for').setRequired(false)
    )
    .addStringOption((option) =>
        option.setName('reason').setDescription('The reason for the ban').setRequired(false)
    );

module.exports.banPerms = {
    adminOnly: false,
    modOnly: true,
    guildOwnerOnly: false,
    requirePerms: [],
    botOwnerOnly: false,
};
