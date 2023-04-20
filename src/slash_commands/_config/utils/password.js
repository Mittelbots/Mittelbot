const { SlashCommandBuilder } = require('discord.js');

module.exports.passwordConfig = new SlashCommandBuilder()
    .setName('password')
    .setDescription('Generate a strong, secure and random password')
    .addIntegerOption((option) =>
        option.setName('length').setDescription('Password length (Min: 8, Max: 64 - Default: 16)')
    );
