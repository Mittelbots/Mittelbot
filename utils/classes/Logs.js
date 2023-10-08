const GuildConfig = require('./Config');

class Logs {
    constructor() {}

    get(guild_id) {
        return new Promise(async (resolve) => {
            const guildConfig = await new GuildConfig().get(guild_id);
            return resolve(guildConfig.logs);
        });
    }

    update({ guild_id, channel, whitelistrole, whitelistchannel, clear }) {
        return new Promise(async (resolve, reject) => {
            const logs = await this.get(guild_id);

            if (whitelistrole || whitelistchannel) {
                if (!logs.whitelist || logs.whitelist.length === 0) {
                    logs.whitelist = [];
                }
                if (whitelistrole) {
                    if (!logs.whitelist.includes(whitelistrole.id)) {
                        logs.whitelist.push(whitelistrole.id);
                    } else {
                        if (!clear) {
                            return reject(
                                global.t.trans(
                                    ['error.admin.logs.alreadyRoleWhitelisted'],
                                    guild_id
                                )
                            );
                        }
                    }
                }
                if (whitelistchannel) {
                    if (!logs.whitelist.includes(whitelistchannel.id)) {
                        logs.whitelist.push(whitelistchannel.id);
                    } else {
                        if (!clear) {
                            return reject(
                                global.t.trans(
                                    ['error.admin.logs.alreadyChannelWhitelisted'],
                                    guild_id
                                )
                            );
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

            new GuildConfig()
                .update({
                    guild_id,
                    value: logs,
                    valueName: 'logs',
                })
                .then(() => {
                    if (whitelistrole || whitelistchannel) {
                        return resolve(
                            global.t.trans(['success.admin.logs.updatedWhitelist'], guild_id)
                        );
                    } else {
                        return resolve(
                            global.t.trans(['success.admin.logs.updatedWhitelist'], guild_id)
                        );
                    }
                })
                .catch(() => {
                    return reject(global.t.trans(['error.general'], guild_id));
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

            await new GuildConfig()
                .update({
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
            if (!logs?.events) return resolve([]);
            return resolve(logs.events);
        });
    }

    isEventEnabled({ guild_id, event }) {
        return new Promise(async (resolve) => {
            const events = await this.getEvents({ guild_id });
            if (!events || events.length === 0) return resolve(true);
            const isDisabled = events.includes(event);
            return resolve(!isDisabled);
        });
    }
}

module.exports = Logs;
