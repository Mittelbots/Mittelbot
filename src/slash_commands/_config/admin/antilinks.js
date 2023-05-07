const { SlashCommandBuilder } = require('discord.js');

module.exports.antiLinksConfig = new SlashCommandBuilder()
    .setName('antilinks')
    .setDescription('Prevent user from sending links.')
    .addStringOption((option) =>
        option
            .setName('enabled')
            .setDescription('Enable/disable links.')
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
            .setName('whitelist')
            .setDescription('Whitelist a role. [@role1, @role2, ...]')
            .setRequired(false)
    );

module.exports.antiLinksPerms = {
    adminOnly: true,
    modOnly: false,
    guildOwnerOnly: false,
    requirePerms: [],
    botOwnerOnly: false,
};
