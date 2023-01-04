const { GuildConfig } = require('./Config');

class Logs {
    constructor() {}

    get(guild_id) {
        return new Promise(async (resolve) => {
            const guildConfig = await GuildConfig.get(guild_id);
            return resolve(guildConfig.logs);
        });
    }

    update({ guild_id, channel, whitelistrole, whitelistchannel, clear }) {
        return new Promise(async (resolve, reject) => {
            const logs = await this.get(guild_id);

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
                }
                if (channel.messagelog) {
                    logs.messagelog = clear ? null : channel.messagelog.id;
                }
                if (channel.modlog) {
                    logs.modlog = clear ? null : channel.modlog.id;
                }
            }

            GuildConfig.update({
                guild_id,
                value: logs,
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
    }

    updateEvents({ guild_id, events, disable = false }) {
        return new Promise(async (resolve, reject) => {
            const logs = await this.get(guild_id);

            if (!logs.events) {
                logs.events = [];
            }

            if (disable) {
                logs.events = [...logs.events, events];
            } else {
                logs.events = logs.events.filter((event) => !events.includes(event));
            }

            await GuildConfig.update({
                guild_id,
                value: logs,
                valueName: 'logs',
            })
                .then(() => {
                    return resolve(true);
                })
                .catch(() => {
                    return reject(false);
                });
        });
    }

    getEvents({ guild_id }) {
        return new Promise(async (resolve) => {
            const logs = await this.get(guild_id);
            return resolve(logs.events);
        });
    }

    isEventEnabled({ guild_id, event }) {
        return new Promise(async (resolve) => {
            const events = await this.getEvents({ guild_id });
            if (!events || events.length == 0) return resolve(true);
            const isDisabled = events.includes(event);
            return resolve(!isDisabled);
        });
    }
}

module.exports.Logs = new Logs();
