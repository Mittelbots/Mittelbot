const { SlashCommandBuilder } = require('discord.js');

module.exports.contributeConfig = new SlashCommandBuilder()
    .setName('contribute')
    .setDescription(
        'Get the link to the Github repository. This is where you can contribute to the bot! :D'
    );
