const {
    getAllGuildIds
} = require("./getAllGuildIds");
const {
    getGuildConfig, updateGuildConfig
} = require("./getConfig");

module.exports.getAllLogs = async () => {

    const all_guild_id = await getAllGuildIds();

    if (all_guild_id) {
        let response = [];
        for (let i in all_guild_id) {
            const obj = {
                guild_id: all_guild_id[i].guild_id,
                logs: await this.getLogs({
                    guild_id: all_guild_id[i].guild_id
                })
            }
            response.push(obj);
        }
        return response;
    } else {
        return false;
    }

}

module.exports.getLogs = async ({
    guild_id
}) => {
    const {
        settings
    } = getGuildConfig({
        guild_id
    });

    var logs;
    try {
        logs = JSON.parse(settings.logs);
    } catch (e) {
        logs = settings.logs || {};
    }

    return logs;
}

module.exports.updateLog = async ({
    guild_id,
    channel,
    whitelistrole,
    whitelistchannel,
    clear
}) => {
    return new Promise(async (resolve, reject) => {
        const logs = this.getLogs({
            guild_id
        })

        if (whitelistrole || whitelistchannel) {
            if (!logs.whitelist || logs.whitelist.length == 0) {
                logs.whitelist = [];
            } else {
                logs.whitelist = JSON.parse(logs.whitelist);
            }
            if (whitelistrole) {
                if (!logs.whitelist.includes(whitelistrole.id)) {
                    logs.whitelist.push(whitelistrole.id);
                } else {
                    if (!clear) {
                        return reject('❌ That role is already whitelisted.')
                    }
                }
            }
            if (whitelistchannel) {
                if (!logs.whitelist.includes(whitelistchannel.id)) {
                    logs.whitelist.push(whitelistchannel.id);
                } else {
                    if (!clear) {
                        return reject('❌ That channel is already whitelisted.')
                    }
                }
            }

            if (clear) {
                if (whitelistrole) {
                    logs.whitelist = logs.whitelist.filter(id => id != whitelistrole.id);
                }
                if (whitelistchannel) {
                    logs.whitelist = logs.whitelist.filter(id => id != whitelistchannel.id);
                }
            }
        }else {
            if(channel.auditlog) {
                logs.auditlog = (clear) ? null : channel.auditlog;
            }
            else if(channel.messaglog) {
                logs.messaglog = (clear) ? null : channel.auditlog;
            }
            else if(channel.modlog) {
                logs.modlog = (clear) ? null : channel.auditlog;
            }
        }

        updateGuildConfig({
            guild_id,
            value: JSON.stringify(logs),
            valueName: "logs"
        }).then(() => {
            if(whitelistrole || whitelistchannel) {
                return resolve(`✅ Successfully updated the whitelist.`)
            }else {
                return resolve(`✅ Successfully updated the logs.`)
            }
        })
        .catch(() => {
            return reject(`❌ Something went wrong. Please try again or contact the Bot Support.`)
        });
    })

}