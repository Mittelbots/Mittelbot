const { SlashCommandBuilder } = require('discord.js');

module.exports.purgeConfig = new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Purge a number of messages from a channel')
    .addNumberOption((option) =>
        option.setName('number').setRequired(true).setDescription('The number of message to delete')
    );
// .addUserOption(option =>
//     option.setName('user')
//     .setDescription('The user to purge')
//     .setRequired(true)
// )

module.exports.purgePerms = {
    adminOnly: false,
    modOnly: false,
    guildOwnerOnly: false,
    requirePerms: [],
    botOwnerOnly: false,
};
