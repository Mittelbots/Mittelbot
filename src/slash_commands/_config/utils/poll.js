const { SlashCommandBuilder } = require('discord.js');

module.exports.pollConfig = new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Make a quick poll with one question')
    .addStringOption((option) =>
        option.setName('question').setDescription('The question to ask').setRequired(true)
    );
