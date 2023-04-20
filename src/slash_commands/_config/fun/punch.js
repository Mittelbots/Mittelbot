const { SlashCommandBuilder } = require('discord.js');

module.exports.punchConfig = new SlashCommandBuilder()
    .setName('punch')
    .setDescription('Punch a user. *Evil laugh*')
    .addUserOption((option) =>
        option.setName('user').setDescription('Select a user.').setRequired(true)
    );
