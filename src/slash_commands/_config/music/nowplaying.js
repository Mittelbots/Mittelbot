const { SlashCommandBuilder } = require('discord.js');

module.exports.nowplayingConfig = new SlashCommandBuilder()
    .setName('nowplaying')
    .setDescription('What song is playing right now?');
