const { SlashCommandBuilder } = require('discord.js');

module.exports.oldestmemberConfig = new SlashCommandBuilder()
    .setName('oldestmember')
    .setDescription('View the oldest member in the server [Exept owner]')
    .addBooleanOption((option) =>
        option.setName('bots').setDescription('Include bots in the search (Default: false)')
    );
