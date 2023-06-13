const Logs = require('~utils/classes/Logs');
const { logConfig, logPerms } = require('../_config/admin/log');

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
            const reset = main_interaction.options.getBoolean('reset');
            await new Logs()
                .update({
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
            await new Logs()
                .update({
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
            await new Logs()
                .update({
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
            await new Logs()
                .update({
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
            await new Logs()
                .update({
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

            await new Logs().updateEvents({
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

module.exports.data = logConfig;
module.exports.permissions = logPerms;
