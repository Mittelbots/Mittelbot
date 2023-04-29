const { SlashCommandBuilder } = require('discord.js');

module.exports.joinrolesConfig = new SlashCommandBuilder()
    .setName('joinroles')
    .setDescription(
        'Add joinroles to your server. Note: If you mention a existing role, it will be removed'
    )
    .addStringOption((joinrole) =>
        joinrole
            .setName('joinroles')
            .setDescription(
                'Add roles to the list of join roles. Split multiple roles with a space.'
            )
            .setRequired(true)
    );

module.exports.joinrolesPerms = {
    adminOnly: true,
    modOnly: false,
    guildOwnerOnly: false,
    requirePerms: [],
    botOwnerOnly: false,
};
