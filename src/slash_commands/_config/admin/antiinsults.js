const { SlashCommandBuilder } = require('discord.js');

module.exports.antiInsultsConfig = new SlashCommandBuilder()
    .setName('antiinsults')
    .setDescription('Prevent user from sending all kind of links.')
    .addStringOption((option) =>
        option
            .setName('enabled')
            .setDescription('Enable/disable anti-invite.')
            .setRequired(true)
            .addChoices({
                name: 'true',
                value: 'true',
            })
            .addChoices({
                name: 'false',
                value: 'false',
            })
    )
    .addStringOption((option) =>
        option
            .setName('action')
            .setDescription('Select an action to take.')
            .setRequired(true)
            .addChoices({
                name: 'ban',
                value: 'ban',
            })
            .addChoices({
                name: 'kick',
                value: 'kick',
            })
            .addChoices({
                name: 'mute',
                value: 'mute',
            })
            .addChoices({
                name: 'delete',
                value: 'delete',
            })
            .addChoices({
                name: 'warn',
                value: 'warn',
            })
    )
    .addStringOption((option) =>
        option
            .setName('words')
            .setDescription(
                'Add words to the insult list separated by comma. Example: "Insult,Insult2,Insult3"'
            )
            .setRequired(false)
    )
    .addStringOption((option) =>
        option
            .setName('remove')
            .setDescription('Select if you want to remove the given words from the list.')
            .setRequired(false)
            .addChoices({
                name: 'True',
                value: 'remove',
            })
    );

module.exports.antiInsultsPerms = {
    adminOnly: true,
    modOnly: false,
    guildOwnerOnly: false,
    requirePerms: [],
    botOwnerOnly: false,
};
