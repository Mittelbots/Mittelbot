const { SlashCommandBuilder } = require('discord.js');

module.exports.kickConfig = new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption((option) =>
        option.setName('user').setDescription('The user to ban').setRequired(true)
    )
    .addStringOption((option) =>
        option.setName('reason').setDescription('The reason for the ban').setRequired(false)
    );
