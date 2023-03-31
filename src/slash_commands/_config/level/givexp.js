const { SlashCommandBuilder } = require('discord.js');

module.exports.givexpConfig = new SlashCommandBuilder()
    .setName('givexp')
    .setDescription('Give someone an amount of xp. *Cheating vibes*')
    .addUserOption((option) =>
        option
            .setName('user')
            .setDescription('The user which will be get the xp.')
            .setRequired(true)
    )
    .addNumberOption((option) =>
        option.setName('xp').setDescription('How many xp you want to add?').setRequired(true)
    );
