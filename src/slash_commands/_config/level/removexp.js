const { SlashCommandBuilder } = require('discord.js');

module.exports.removexpConfig = new SlashCommandBuilder()
    .setName('removexp')
    .setDescription('Remove xp from someone. *Cheating vibes*')
    .addUserOption((option) =>
        option
            .setName('user')
            .setDescription('The user which will have less xp afterwards.')
            .setRequired(true)
    )
    .addNumberOption((option) =>
        option.setName('xp').setDescription('How many xp you want to remove?').setRequired(true)
    );
