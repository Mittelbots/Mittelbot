const { updateGuildConfig, GuildConfig } = require('./Config');

module.exports.getLogs = async ({ guild_id }) => {
    const guildConfig = await GuildConfig.get(guild_id);

    return guildConfig.logs;
};

module.exports.updateLog = async ({
    guild_id,
    channel,
    whitelistrole,
    whitelistchannel,
    clear,
}) => {
    return new Promise(async (resolve, reject) => {
        const logs = await this.getLogs({
            guild_id,
        });

        if (whitelistrole || whitelistchannel) {
            if (!logs.whitelist || logs.whitelist.length == 0) {
                logs.whitelist = [];
            }
            if (whitelistrole) {
                if (!logs.whitelist.includes(whitelistrole.id)) {
                    logs.whitelist.push(whitelistrole.id);
                } else {
                    if (!clear) {
                        return reject('❌ That role is already whitelisted.');
                    }
                }
            }
            if (whitelistchannel) {
                if (!logs.whitelist.includes(whitelistchannel.id)) {
                    logs.whitelist.push(whitelistchannel.id);
                } else {
                    if (!clear) {
                        return reject('❌ That channel is already whitelisted.');
                    }
                }
            }

            if (clear) {
                if (whitelistrole) {
                    logs.whitelist = logs.whitelist.filter((id) => id != whitelistrole.id);
                }
                if (whitelistchannel) {
                    logs.whitelist = logs.whitelist.filter((id) => id != whitelistchannel.id);
                }
            }
        } else {
            if (channel.auditlog) {
                logs.auditlog = clear ? null : channel.auditlog.id;
            } else if (channel.messagelog) {
                logs.messagelog = clear ? null : channel.messagelog.id;
            } else if (channel.modlog) {
                logs.modlog = clear ? null : channel.modlog.id;
            }
        }

        updateGuildConfig({
            guild_id,
            value: JSON.stringify(logs),
            valueName: 'logs',
        })
            .then(() => {
                if (whitelistrole || whitelistchannel) {
                    return resolve(`✅ Successfully updated the whitelist.`);
                } else {
                    return resolve(`✅ Successfully updated the logs.`);
                }
            })
            .catch(() => {
                return reject(
                    `❌ Something went wrong. Please try again or contact the Bot Support.`
                );
            });
    });
};
