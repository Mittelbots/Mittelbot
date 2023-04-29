const { SlashCommandBuilder } = require('discord.js');

module.exports.languageConfig = new SlashCommandBuilder()
    .setName('language')
    .setDescription('Set the language for the server')
    .addStringOption((string) =>
        string
            .setName('language')
            .setDescription('Set the language for the server.')
            .setRequired(true)
            .addChoices({
                name: 'English',
                value: 'en_EN',
            })
            .addChoices({
                name: 'German',
                value: 'de_DE',
            })
    );
