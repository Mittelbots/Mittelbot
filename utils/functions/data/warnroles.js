const database = require("../../../src/db/db");
const {
    errorhandler
} = require("../errorhandler/errorhandler");
const {
    getAllGuildIds
} = require("./getAllGuildIds");
const config = require('../../../src/assets/json/_config/config.json');
const {
    updateCache,
    addValueToCache,
    getFromCache
} = require("../cache/cache");
const {
    checkRole
} = require("../roles/checkRole");

module.exports.getAllWarnroles = async () => {

    const all_guild_id = await getAllGuildIds();

    if (all_guild_id) {
        let response = [];
        for (let i in all_guild_id) {
            const obj = {
                guild_id: all_guild_id[i].guild_id,
                warnroles: await this.getWarnroles({
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

module.exports.getWarnroles = async ({
    guild_id
}) => {
    return await database.query(`SELECT * FROM ${guild_id}_guild_warnroles`)
        .then(res => {
            if (res.length > 0) {
                return res;
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


module.exports.addWarnroles = async ({
    guild_id,
    warnrole_id
}) => {
    return await database.query(`INSERT INTO ${guild_id}_guild_warnroles (${config.settings.warnroles.colname}) VALUES (?)`, [warnrole_id])
        .then(() => {
            return {
                error: false
            }
        })
        .catch(err => {
            errorhandler({
                err,
                fatal: true
            });
            return {
                error: true,
                message: "An error occured while adding the warnrole"
            }

        });
}

module.exports.removeWarnroles = ({
    guild_id,
    warnrole_id
}) => {

    updateCache({
        cacheName: `warnroles`,
        param_id: [guild_id, warnrole_id],
        updateValName: `roles`
    })

    return database.query(`DELETE FROM ${guild_id}_guild_warnroles WHERE role_id = ?`, [warnrole_id])
        .then(() => {
            return {
                error: false
            }
        })
        .catch(err => {
            errorhandler({
                err,
                fatal: true
            });
            return {
                error: true,
                message: "An error occured while removing the warnrole"
            }
        });
}


module.exports.updateWarnroles = async ({
    guild,
    roles,
    user
}) => {
    return new Promise(async (resolve, reject) => {
        const cache = await getFromCache({
            cacheName: 'warnroles',
            param_id: guild.id
        });

        if (cache[0].roles !== undefined && cache[0].roles.length !== 0) {
            const cacheRoles = cache[0].roles;

            let removedRoles = '';
            for (let i in roles) {

                const checkedRoles = await checkRole({
                    guild: guild,
                    role_id: roles[i]
                });

                if (!checkedRoles) {
                    return reject(`${roles[i]} doesn't exists! All existing mentions before are saved.`)
                }
                await cacheRoles.map(role => {
                    if (roles[i] === role.role_id) {
                        let removed = this.removeWarnroles({
                            guild_id: guild.id,
                            warnrole_id: roles[i],
                        });

                        if (removed.error) {
                            return reject(removed.message)
                        } else {
                            removedRoles += `<@&${roles[i]}> `;
                            delete roles[i];
                        }
                    }
                })
            }
            if (removedRoles !== '') {
                return reject(`Removed ${removedRoles}`)
            }
        }

        for (let i in roles) {
            const checkedRoles = await checkRole({
                guild: guild,
                role_id: roles[i]
            });

            if (!checkedRoles) {
                return reject(`${roles[i]} doesn't exists! All existing mentions before are saved.`)
            }

            try {
                if (!user.roles.cache.find(r => r.id.toString() === roles[i].toString())) {
                    await user.roles.add(roles[i]).catch(err => {});
                    user.roles.remove(roles[i]).catch(err => {});
                } else {
                    await user.roles.remove(roles[i]).catch(err => {});
                    user.roles.add(roles[i]).catch(err => {});
                }
            } catch (err) {
                return reject(`I don't have the permission to add this role: **<@&${roles[i]}>**`)
            }
        }
        for (let i in roles) {
            const added = await this.addWarnroles({
                guild_id: guild.id,
                warnrole_id: roles[i]
            })

            if (added.error) {
                return reject(added.message)
            } else {
                await addValueToCache({
                    cacheName: 'warnroles',
                    param_id: guild.id,
                    value: roles[i],
                    valueName: 'roles'
                });

                const cache = await getFromCache({
                    cacheName: 'warnroles',
                    param_id: guild.id
                })
            }
        }
        return resolve(true)
    })
}