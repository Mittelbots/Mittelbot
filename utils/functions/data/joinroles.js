const database = require("../../../src/db/db");
const {
    getAllGuildIds
} = require("./getAllGuildIds");
const {
    getFromCache,
    updateCache
} = require('../cache/cache');
const {
    errorhandler
} = require("../errorhandler/errorhandler");
const {
    checkRole
} = require("../roles/checkRole");

module.exports.removeJoinrole = ({
    guild_id,
    joinrole_id
}) => {
    updateCache({
        cacheName: `joinroles`,
        param_id: [guild_id, joinrole_id],
        updateValName: `role_id`
    })

    return database.query(`DELETE FROM ${guild_id}_guild_joinroles WHERE role_id = ?`, [joinrole_id])
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
                message: "An error occured while removing the joinrole"
            }
        });
}


module.exports.updateJoinroles = async ({
    guild,
    roles,
    user
}) => {
    return new Promise(async (resolve, reject) => {
        const cache = await getFromCache({
            cacheName: 'joinroles',
            param_id: guild.id
        });

        if (cache[0].role_id !== undefined && cache[0].role_id.length !== 0) {
            const cacheRoles = cache[0].role_id;
            let removedRoles = '';

            for (let i in roles) {

                const checkedRoles = await checkRole({
                    guild,
                    role_id: roles[i]
                });
                if (!checkedRoles) {
                    return reject(`<@&${roles[i]}> doesn't exists! All existing mentions before are saved.`)
                }
                await cacheRoles.map(role => {
                    if (roles[i] === role.role_id) {
                        let removed = this.removeJoinrole({
                            guild_id: guild.id,
                            joinrole_id: roles[i],
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
                resolve(`Removed ${removedRoles}`)
            }
        } else {
            cache[0].role_id = [];
        }

        var passedRoles = [];
        for (let i in roles) {
            try {
                var role = guild.roles.cache.get(roles[i]);
                if (role.tags && role.tags.botId) continue;
            } catch (err) {
                return reject(`${roles[i]} doesn't exists! All existing mentions before are saved.`)
            }
            try {
                if (!user.roles.cache.find(r => r.id.toString() === role.id.toString())) {
                    await user.roles.add(role).catch(err => {});
                    await user.roles.remove(role).catch(err => {});
                } else {
                    await user.roles.remove(role).catch(err => {});
                    await user.roles.add(role).catch(err => {});
                }
            } catch (err) {
                return reject(`I don't have the permission to add this role: **${role}**`)
            }
            passedRoles.push(role.id);
        }
        for (let i in passedRoles) {
            await this.saveJoinRoles({
                guild_id: guild.id,
                joinrole_id: passedRoles[i]
            }).then(res => {})
            .catch(err => {
                console.log(err);
            })
        }
        return resolve(true)
    })
}

module.exports.saveJoinRoles = async ({
    guild_id,
    joinrole_id
}) => {
    return new Promise(async (resolve, reject) => {
        if (!joinrole_id) {

            await updateCache({
                cacheName: 'joinroles',
                param_id: [guild_id],
                updateValName: 'role_id',
            });

            return await database.query(`DELETE FROM ${guild_id}_guild_joinroles`)
                .then(() => {
                    resolve(`Joinroles successfully cleared.`).catch(err => {});
                })
                .catch(err => {
                    return errorhandler({
                        err,
                        fatal: true
                    });
                });
        } else {

            const cache = await getFromCache({
                cacheName: 'joinroles',
                param_id: guild_id,
            });

            roles = cache[0].role_id;


            const obj = {
                id: (roles.length > 0) ? cache[0].role_id[cache[0].role_id.length - 1].id + 1 : 1,
                role_id: joinrole_id,
            }

            roles.push(obj);

            await updateCache({
                cacheName: 'joinroles',
                param_id: [guild_id],
                updateVal: roles,
                updateValName: 'role_id',
            });
            return await database.query(`INSERT INTO ${guild_id}_guild_joinroles (role_id) VALUES (?)`, [joinrole_id])
                .then(() => {
                    resolve(`<@&${joinrole_id}> added to joinroles.`)
                })
                .catch(err => {
                    return errorhandler({
                        err,
                        fatal: true
                    });
                })
        }
    })
}