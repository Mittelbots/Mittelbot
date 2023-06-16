const { SlashCommandBuilder } = require('discord.js');

module.exports.logConfig = new SlashCommandBuilder()
    .setName('log')
    .setDescription('Set log channels for the server')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('set')
            .setDescription('Set a log channel.')
            .addChannelOption((auditlog) =>
                auditlog
                    .setName('auditlog')
                    .setDescription(
                        'Add a channel to see delted messages or changes from the server.'
                    )
                    .setRequired(false)
            )
            .addChannelOption((messagelog) =>
                messagelog
                    .setName('messagelog')
                    .setDescription('Add a channel to see edited messages.')
                    .setRequired(false)
            )
            .addChannelOption((modlog) =>
                modlog
                    .setName('modlog')
                    .setDescription(
                        'Add a channel to see moderation logs for example if a user gets muted.'
                    )
                    .setRequired(false)
            )
            .addBooleanOption((string) =>
                string.setName('reset').setDescription('Reset all log channels.').setRequired(false)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('whitelist_role')
            .setDescription('Add a role to the whitelist.')
            .addRoleOption((role) =>
                role
                    .setName('role')
                    .setDescription('Select a role to add to the whitelist.')
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('whitelist_channel')
            .setDescription('Add a channel to the whitelist.')
            .addChannelOption((channel) =>
                channel
                    .setName('channel')
                    .setDescription('Select a channel to add to the whitelist.')
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('remove_whitelist_role')
            .setDescription('Remove a role from the whitelist.')
            .addRoleOption((role) =>
                role
                    .setName('role')
                    .setDescription('Select a role to remove from the whitelist.')
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('remove_whitelist_channel')
            .setDescription('Remove a channel from the whitelist.')
            .addChannelOption((channel) =>
                channel
                    .setName('channel')
                    .setDescription('Select a channel to remove from the whitelist.')
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('events')
            .setDescription('Disable or enable specific auditlog events.')
            .addStringOption((string) =>
                string
                    .setName('event')
                    .setDescription('Select an event to disable or enable.')
                    .setRequired(true)
                    .addChoices({
                        name: 'Message delete',
                        value: 'message_delete',
                    })
                    .addChoices({
                        name: 'Message bulk-delete',
                        value: 'message_bulk_delete',
                    })
                    .addChoices({
                        name: 'Message update',
                        value: 'message_update',
                    })
                    .addChoices({
                        name: 'Member ban',
                        value: 'member_ban_add',
                    })
                    .addChoices({
                        name: 'Member unban',
                        value: 'member_ban_remove',
                    })
                    .addChoices({
                        name: 'Channel create',
                        value: 'channel_create',
                    })
                    .addChoices({
                        name: 'Channel delete',
                        value: 'channel_delete',
                    })
                    .addChoices({
                        name: 'Channel update',
                        value: 'channel_update',
                    })
                    .addChoices({
                        name: 'Role create',
                        value: 'role_create',
                    })
                    .addChoices({
                        name: 'Role delete',
                        value: 'role_delete',
                    })
                    .addChoices({
                        name: 'Role update',
                        value: 'role_update',
                    })
                    .addChoices({
                        name: 'Nickname update',
                        value: 'guildMemberNicknameUpdate',
                    })
                    .addChoices({
                        name: 'Member offline',
                        value: 'guildMemberOffline',
                    })
                    .addChoices({
                        name: 'Member online',
                        value: 'guildMemberOnline',
                    })
                    .addChoices({
                        name: 'Member role add',
                        value: 'guildMemberRoleAdd',
                    })
                    .addChoices({
                        name: 'Member role remove',
                        value: 'guildMemberRoleRemove',
                    })
                    .addChoices({
                        name: 'Member avatar update',
                        value: 'userAvatarUpdate',
                    })
                    .addChoices({
                        name: 'Username update',
                        value: 'userUsernameUpdate',
                    })
            )
            .addStringOption((string) =>
                string
                    .setName('status')
                    .setDescription('Disable or enable the event.')
                    .setRequired(true)
                    .addChoices({
                        name: 'Disable',
                        value: 'disable',
                    })
                    .addChoices({
                        name: 'Enable',
                        value: 'enable',
                    })
            )
    );

module.exports.logPerms = {
    adminOnly: true,
    modOnly: false,
    guildOwnerOnly: false,
    requirePerms: [],
    botOwnerOnly: false,
};
