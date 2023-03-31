const { SlashCommandBuilder } = require('discord.js');

module.exports.catsConfig = new SlashCommandBuilder()
    .setName('cats')
    .setDescription('Get pics of Cats. THE PURE CUTENESS!!!');
