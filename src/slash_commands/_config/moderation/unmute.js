const { SlashCommandBuilder } = require('discord.js');

module.exports.unmuteConfig = new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Unmute an user from the server')
    .addUserOption((option) =>
        option.setName('user').setDescription('The user to unmute').setRequired(true)
    )
    .addStringOption((option) =>
        option.setName('reason').setDescription('The reason for the unmute').setRequired(false)
    );
