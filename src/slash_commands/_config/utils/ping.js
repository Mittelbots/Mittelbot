const { SlashCommandBuilder } = require('discord.js');

module.exports.pingConfig = new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Replies the ping');
