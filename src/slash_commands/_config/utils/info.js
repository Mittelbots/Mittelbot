const { SlashCommandBuilder } = require('discord.js');

module.exports.infoConfig = new SlashCommandBuilder()
    .setName('info')
    .setDescription('Get information about yourself or another user')
    .addUserOption((option) =>
        option
            .setName('user')
            .setDescription('The user to get information about')
            .setRequired(false)
    );
