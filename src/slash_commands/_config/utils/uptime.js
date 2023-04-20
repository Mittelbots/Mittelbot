const { SlashCommandBuilder } = require('discord.js');

module.exports.uptimeConfig = new SlashCommandBuilder()
    .setName('uptime')
    .setDescription('How long has the bot been running?');
