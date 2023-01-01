const { SlashCommandBuilder } = require('discord.js');
const { Logs } = require('../../../utils/functions/data/Logs');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

    const subcommand = main_interaction.options.getSubcommand();
    switch (subcommand) {
        case 'set':
            const auditlog = main_interaction.options.getChannel('auditlog');
            const messagelog = main_interaction.options.getChannel('messagelog');
            const modlog = main_interaction.options.getChannel('modlog');
            const reset = main_interaction.options.getString('reset');
            await Logs.update({
                guild_id: main_interaction.guild.id,
                channel: {
                    auditlog: auditlog,
                    messagelog: messagelog,
                    modlog: modlog,
                },
                clear: reset,
            })
                .then((res) => {
                    sendResponse(res);
                })
                .catch((err) => {
                    sendResponse(err);
                });
            break;
        case 'whitelist_role':
            const role = main_interaction.options.getRole('role');
            await Logs.update({
                guild_id: main_interaction.guild.id,
                whitelistrole: role,
            })
                .then((res) => {
                    sendResponse(res);
                })
                .catch((err) => {
                    sendResponse(err);
                });
            break;
        case 'whitelist_channel':
            const channel = main_interaction.options.getChannel('channel');
            await Logs.update({
                guild_id: main_interaction.guild.id,
                whitelistchannel: channel,
            })
                .then((res) => {
                    sendResponse(res);
                })
                .catch((err) => {
                    sendResponse(err);
                });
            break;
        case 'whitelist_clear':
            const clear_channel = main_interaction.options.getChannel('channel');
            await Logs.update({
                guild_id: main_interaction.guild.id,
                whitelistchannel: clear_channel,
                clear: true,
            })
                .then((res) => {
                    sendResponse(res);
                })
                .catch((err) => {
                    sendResponse(err);
                });
            break;
        case 'whitelist_clear_role':
            const clear_role = main_interaction.options.getRole('role');
            await Logs.update({
                guild_id: main_interaction.guild.id,
                whitelistrole: clear_role,
                clear: true,
            })
                .then((res) => {
                    sendResponse(res);
                })
                .catch((err) => {
                    sendResponse(err);
                });
            break;

        case 'events':
            const event = main_interaction.options.getString('event');
            const status = main_interaction.options.getString('status');

            await Logs.updateEvents({
                guild_id: main_interaction.guild.id,
                events: event,
                disable: status === 'disable' ? true : false,
            });

            sendResponse(`✅ Event ${event} has been ${status}d`);
    }

    function sendResponse(res) {
        main_interaction
            .followUp({
                content: res,
                ephemeral: true,
            })
            .catch((err) => {});
    }
};

module.exports.data = new SlashCommandBuilder()
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
            .addStringOption((string) =>
                string
                    .setName('reset')
                    .setDescription('Reset all log channels.')
                    .setRequired(false)
                    .addChoices({
                        name: 'Reset',
                        value: 'reset',
                    })
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
                        name: 'Message Delete',
                        value: 'message_delete',
                    })
                    .addChoices({
                        name: 'Message Bulk Delete',
                        value: 'message_bulk_delete',
                    })
                    .addChoices({
                        name: 'Message Update',
                        value: 'message_update',
                    })
                    .addChoices({
                        name: 'Member Ban',
                        value: 'member_ban_add',
                    })
                    .addChoices({
                        name: 'Member Unban',
                        value: 'member_ban_remove',
                    })
                    .addChoices({
                        name: 'Channel Create',
                        value: 'channel_create',
                    })
                    .addChoices({
                        name: 'Channel Delete',
                        value: 'channel_delete',
                    })
                    .addChoices({
                        name: 'Channel Update',
                        value: 'channel_update',
                    })
                    .addChoices({
                        name: 'Channel Update',
                        value: 'channel_update',
                    })
                    .addChoices({
                        name: 'Role Create',
                        value: 'role_create',
                    })
                    .addChoices({
                        name: 'Role Delete',
                        value: 'role_delete',
                    })
                    .addChoices({
                        name: 'Role Update',
                        value: 'role_update',
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
