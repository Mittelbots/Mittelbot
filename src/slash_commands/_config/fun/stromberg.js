const { SlashCommandBuilder } = require('discord.js');

module.exports.strombergConfig = new SlashCommandBuilder()
    .setName('stromberg')
    .setDescription('Get a random stromberg quote or a character.')
    .addStringOption((option) =>
        option
            .setName('type')
            .setDescription('Select a type.')
            .setRequired(true)
            .addChoices({
                name: 'Quotes',
                value: 'quotes',
            })
            .addChoices({
                name: 'Characters',
                value: 'characters',
            })
    );
