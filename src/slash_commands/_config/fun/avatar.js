const { SlashCommandBuilder } = require('discord.js');

module.exports.avatarConfig = new SlashCommandBuilder()
    .setName('avatar')
    .setDescription('Steel the avatar of a mentioned user')
    .addUserOption((option) =>
        option
            .setName('user')
            .setDescription('The user you want to steel the avatar of')
            .setRequired(false)
    );
