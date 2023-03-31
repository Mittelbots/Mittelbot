const { SlashCommandBuilder } = require('discord.js');

module.exports.shipConfig = new SlashCommandBuilder()
    .setName('ship')
    .setDescription('Ship you and a mentioned user and see if they are compatible.')
    .addUserOption((option) =>
        option.setName('user').setDescription('The user you want to ship.').setRequired(true)
    );
