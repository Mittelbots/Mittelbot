const { SlashCommandBuilder } = require('discord.js');

module.exports.rankConfig = new SlashCommandBuilder()
    .setName('rank')
    .setDescription("Get your or another user's rank.")
    .addUserOption((option) =>
        option.setName('user').setDescription('The user to get the rank of.').setRequired(false)
    );
