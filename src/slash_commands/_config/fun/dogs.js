const { SlashCommandBuilder } = require('discord.js');

module.exports.dogsConfig = new SlashCommandBuilder()
    .setName('dogs')
    .setDescription('Get pics of dogs. THE PURE CUTENESS!!!');
