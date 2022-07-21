const database = require("../../../src/db/db");
const {
    getFromCache,
    updateCache,
    logs
} = require("../cache/cache");
const {
    errorhandler
} = require("../errorhandler/errorhandler");
const {
    getAllGuildIds
} = require("./getAllGuildIds");

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
    return await database.query(`SELECT * FROM ${guild_id}_guild_logs`)
        .then(res => {
            if (res.length > 0) {
                return res[0];
            } else {
                return false;
            }
        })
        .catch(err => {
            errorhandler({
                err: err,
                fatal: true
            });
            return false;
        });
}

module.exports.updateLog = async ({
    guild_id,
    channel,
    dbcol,
    whitelistrole,
    whitelistchannel,
    clear
}) => {
    return new Promise(async (resolve, reject) => {
        const cache = await getFromCache({
            cacheName: 'logs',
            param_id: guild_id,
        });

        if (cache) {
            if (whitelistrole || whitelistchannel) {
                if (!cache[0].whitelist || cache[0].whitelist.length == 0) {
                    cache[0].whitelist = [];
                } else {
                    cache[0].whitelist = JSON.parse(cache[0].whitelist);
                }
                if(whitelistrole){
                    if (!cache[0].whitelist.includes(whitelistrole.id)) {
                        cache[0].whitelist.push(whitelistrole.id);
                    }else {
                        if(!clear) {
                            return reject('❌ That role is already whitelisted.')
                        }
                    }
                }
                if(whitelistchannel){
                    if (!cache[0].whitelist.includes(whitelistchannel.id)) {
                        cache[0].whitelist.push(whitelistchannel.id);
                    }else {
                        if(!clear) {
                            return reject('❌ That channel is already whitelisted.')
                        }
                    }
                }

                if (clear) {
                    if(whitelistrole) {
                        cache[0].whitelist = cache[0].whitelist.filter(id => id != whitelistrole.id);
                    }
                    if(whitelistchannel) {
                        cache[0].whitelist = cache[0].whitelist.filter(id => id != whitelistchannel.id);
                    }
                }


                for (let i in logs) {
                    if (logs[i].id == guild_id) {
                        logs[i].whitelist = JSON.stringify(cache[0].whitelist);
                    }
                }
            } else {
                await updateCache({
                    cacheName: 'logs',
                    param_id: guild_id,
                    updateVal: (JSON.parse(clear)) ? null : channel.id,
                    updateValName: dbcol
                });
            }
        }

        if (whitelistrole || whitelistchannel) {
            var whitelist = await database.query(`SELECT whitelist FROM ${guild_id}_guild_logs WHERE id = ?`, [1])
                .then(res => {
                    return res[0].whitelist
                })
                .catch(err => {
                    reject(`❌ Something went wrong. Please try again or contact the Bot Support.`)
                    return errorhandler({
                        err,
                        fatal: true
                    });
                });

            if (!whitelist || whitelist.length === 0) {
                whitelist = [];
            } else {
                whitelist = JSON.parse(whitelist);
            }


            if(whitelistrole){
                if (!whitelist.includes(whitelistrole.id)) {
                    whitelist.push(whitelistrole.id);
                }else {
                    if(!clear) {
                        return reject('❌ That role is already whitelisted.')
                    }
                }
            }

            if(whitelistchannel){
                if (!whitelist.includes(whitelistchannel.id)) {
                    whitelist.push(whitelistchannel.id);
                }else {
                    if(!clear) {
                        return reject('❌ That channel is already whitelisted.')
                    }
                }
            }


            if (clear) {
                if(whitelistrole) {
                    whitelist = whitelist.filter(id => id != whitelistrole.id);
                }
                if(whitelistchannel) {
                    whitelist = whitelist.filter(id => id != whitelistchannel.id);
                }
            }

            return await database.query(`UPDATE ${guild_id}_guild_logs SET whitelist = ? WHERE id = 1`, [JSON.stringify(whitelist)])
                .then(() => resolve(`✅ Successfully updated the whitelist.`))
                .catch(err => {
                    reject(`❌ Something went wrong. Please try again or contact the Bot Support.`)
                    return errorhandler({
                        err,
                        fatal: true
                    });
                });

        } else {
            await database.query(`UPDATE ${guild_id}_guild_logs SET ${dbcol} = ? WHERE id = 1`, [(JSON.parse(clear)) ? null : channel.id])
                .then(() => resolve(`✅ Successfully updated \`${dbcol}\`.`))
                .catch(err => {
                    reject(`❌ Something went wrong. Please try again or contact the Bot Support.`)
                    return errorhandler({
                        err,
                        fatal: true
                    });
                });
        }
    })

}