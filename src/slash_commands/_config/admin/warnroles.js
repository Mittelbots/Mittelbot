const { SlashCommandBuilder } = require('discord.js');

module.exports.warnRolesConfig = new SlashCommandBuilder()
    .setName('warnroles')
    .setDescription('Setup warnroles which will apply when a user is warned')
    .addStringOption((warnrole) =>
        warnrole
            .setName('warnroles')
            .setDescription(
                'Add roles. Split multiple roles with a space. To remove a role insert the role.'
            )
            .setRequired(true)
    );

module.exports.warnRolesPerms = {
    adminOnly: true,
    modOnly: false,
    guildOwnerOnly: false,
    requirePerms: [],
    botOwnerOnly: false,
};
