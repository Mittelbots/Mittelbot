const { SlashCommandBuilder } = require('discord.js');

module.exports.antiInviteConfig = new SlashCommandBuilder()
    .setName('antiinvite')
    .setDescription('Prevent user from sending discord invite links.')
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
    );

module.exports.antiInvitePerms = {
    adminOnly: true,
    modOnly: false,
    guildOwnerOnly: false,
    requirePerms: [],
    botOwnerOnly: false,
};
