const { SlashCommandBuilder } = require('discord.js');

module.exports.playConfig = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays a song')
    .addStringOption((option) =>
        option
            .setName('target')
            .setDescription('The Song or playlist you want to play')
            .setRequired(true)
    );
