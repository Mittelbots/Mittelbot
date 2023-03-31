const { SlashCommandBuilder } = require('discord.js');

module.exports.disconnectConfig = new SlashCommandBuilder()
    .setName('disconnect')
    .setDescription('Disconnect the bot from the voice channel.');
