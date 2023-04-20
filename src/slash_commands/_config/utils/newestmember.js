const { SlashCommandBuilder } = require('discord.js');

module.exports.newestmemberConfig = new SlashCommandBuilder()
    .setName('newestmember')
    .setDescription('View the newest member in the server')
    .addBooleanOption((option) =>
        option.setName('bots').setDescription('Include bots in the search (Default: false)')
    );
