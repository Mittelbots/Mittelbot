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
                value: 'en_US',
            })
            .addChoices({
                name: 'German',
                value: 'de_DE',
            })
            .addChoices({
                name: 'Hungarian',
                value: 'hu_HU',
            })
            .addChoices({
                name: 'Polish',
                value: 'pl_PL',
            })
    );

module.exports.languagePerms = {
    adminOnly: true,
    modOnly: false,
    guildOwnerOnly: false,
    requirePerms: [],
    botOwnerOnly: false,
};
