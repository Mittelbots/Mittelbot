const { SlashCommandBuilder } = require('discord.js');

module.exports.unbanConfig = new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban an user from the server')
    .addUserOption((option) =>
        option.setName('user').setDescription('The user to unban').setRequired(true)
    )
    .addStringOption((option) =>
        option.setName('reason').setDescription('The reason for the unban').setRequired(false)
    );
