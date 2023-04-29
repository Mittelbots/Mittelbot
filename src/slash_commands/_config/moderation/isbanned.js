const { SlashCommandBuilder } = require('discord.js');

module.exports.isbannedConfig = new SlashCommandBuilder()
    .setName('isbanned')
    .setDescription('See if an user is banned')
    .addUserOption((option) =>
        option.setName('user').setRequired(true).setDescription('The user to check')
    );

module.exports.isbannedPerms = {
    adminOnly: false,
    modOnly: false,
    guildOwnerOnly: false,
    requirePerms: [],
    botOwnerOnly: false,
};
