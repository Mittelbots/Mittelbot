const { SlashCommandBuilder } = require('discord.js');

module.exports.autoModConfig = new SlashCommandBuilder()
    .setName('automod')
    .setDescription('All settings related to automoderation.')

    .addSubcommand((command) =>
        command
            .setName('whitelistroles')
            .setDescription("Configure whitelist role which wont't be effected by the automod.")
            .addRoleOption((option) =>
                option.setName('role').setDescription('Enable/disable anti-spam.').setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('remove')
                    .setDescription('Select if you want to remove the role from the whitelist.')
                    .setRequired(false)
                    .addChoices({
                        name: 'remove',
                        value: 'remove',
                    })
            )
    )

    .addSubcommand((command) =>
        command
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
            )
    )
    .addSubcommand((command) =>
        command
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
    );

module.exports.automodPerms = {
    adminOnly: true,
    modOnly: false,
    guildOwnerOnly: false,
    requirePerms: [],
    botOwnerOnly: false,
};
