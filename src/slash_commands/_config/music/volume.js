const { SlashCommandBuilder } = require('discord.js');

module.exports.volumeConfig = new SlashCommandBuilder()
    .setName('volume')
    .setDescription('Adjust the volume')
    .addNumberOption((option) =>
        option.setName('volume').setDescription('The volume to set (0-100)').setRequired(true)
    );
