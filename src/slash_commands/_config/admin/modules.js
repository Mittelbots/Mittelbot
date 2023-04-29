const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports.modulesConfig = new SlashCommandBuilder()
    .setName('modules')
    .setDescription('Activate or deactivate modules')
    .addStringOption((option) =>
        option
            .setName('module')
            .setDescription('The module you want to activate or deactivate')
            .setAutocomplete(true)
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('status')
            .setDescription('Activate or deactivate the module')
            .addChoices({
                name: 'Activate',
                value: 'activate',
            })
            .addChoices({
                name: 'Deactivate',
                value: 'deactivate',
            })
            .setRequired(true)
    );

module.exports.modulesPerms = {
    adminOnly: false,
    modOnly: false,
    guildOwnerOnly: false,
    requirePerms: [PermissionFlagsBits.Administrator],
    botOwnerOnly: false,
};
