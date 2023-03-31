const { SlashCommandBuilder } = require('discord.js');

module.exports.prideConfig = new SlashCommandBuilder()
    .setName('pride')
    .setDescription('Get information about a random gender')
    .addStringOption((option) =>
        option
            .setName('type')
            .setDescription('Select a type.')
            .setRequired(true)
            .addChoices({
                name: 'Genders',
                value: 'gender',
            })
            .addChoices({
                name: 'Sexualities',
                value: 'sexuality',
            })
    );
