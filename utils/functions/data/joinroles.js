const database = require("../../../src/db/db");
const { getAllGuildIds } = require("./getAllGuildIds");
const { getFromCache, updateCache } = require('../cache/cache');
const { errorhandler } = require("../errorhandler/errorhandler");
const { checkRole } = require("../roles/checkRole");

module.exports.getAllJoinroles = async () => {

    const all_guild_id = await getAllGuildIds();

    if(all_guild_id) {
        let response = [];
        for(let i in all_guild_id) {
            const obj = {
                guild_id: all_guild_id[i].guild_id,
                joinroles: await this.getJoinroles({guild_id: all_guild_id[i].guild_id})
            }
            response.push(obj);
        }
        return response;
    }else {
        return false;
    }

}

module.exports.getJoinroles = async ({guild_id}) => {

    const cache = await getFromCache({
        cacheName: "joinroles",
        param_id: guild_id
    });

    if(cache.length > 0) {
        return cache[0].role_id;
    }

    return await database.query(`SELECT * FROM ${guild_id}_guild_joinroles`)
    .then(res => {
        if(res.length > 0) {
            return res;
        }else {
            return false;
        }
    })
    .catch(err => {
        errorhandler({err: err, fatal: true});
        return false;
    });
}

module.exports.removeJoinrole = ({guild_id, joinrole_id}) => {
    updateCache({
        cacheName: `joinroles`,
        param_id: [guild_id, joinrole_id],
        updateValName: `role_id`
    })

    return database.query(`DELETE FROM ${guild_id}_guild_joinroles WHERE role_id = ?`, [joinrole_id])
    .then(() => {
        return {
            error:false
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


module.exports.updateJoinroles = async ({guild_id, roles, message}) => {
    const cache = await getFromCache({
        cacheName: 'joinroles',
        param_id: guild_id
    });
    
    if (cache[0].role_id !== undefined && cache[0].role_id.length !== 0) {
        const cacheRoles = cache[0].role_id;
        let removedRoles = '';

        for (let i in roles) {

            const checkedRoles = await checkRole({
                guild: message.guild,
                role_id: roles[i]
            });

            if(!checkedRoles) {
                return message.reply(`${roles[i]} doesn't exists! All existing mentions before are saved.`).catch(err => {});
            }
            await cacheRoles.map(role => {
                if (roles[i] === role.role_id ) {
                    let removed = this.removeJoinrole({
                        guild_id: message.guild.id,
                        joinrole_id: roles[i],
                    });

                    if (removed.error) {
                        return message.reply(removed.message).catch(err => {});
                    } else {
                        removedRoles += `<@&${roles[i]}> `;
                        delete roles[i];
                    }
                }
            })
        }
        if(removedRoles !== '') {
            return message.reply(`Removed ${removedRoles}`).catch(err => {});
        }
    }else {
        cache[0].role_id = [];
    }

    var passedRoles = [];
    for (let i in roles) {
        try {
            var role = message.guild.roles.cache.get(roles[i]);
            if(role.tags.botId) continue;
        } catch (err) {
            return message.reply(`${roles[i]} doesn't exists! All existing mentions before are saved.`).catch(err => {});
        }
        try {
            if (!message.member.roles.cache.find(r => r.id.toString() === role.id.toString())) {
                await message.member.roles.add(role).catch(err => {});
                await message.member.roles.remove(role).catch(err => {});
            } else {
                await message.member.roles.remove(role).catch(err => {});
                await message.member.roles.add(role).catch(err => {});
            }
        } catch (err) {
            return message.reply(`I don't have the permission to add this role: **${role}**`).catch(err => {});
        }
        passedRoles.push(role.id);
    }
    for (let i in passedRoles) {
        await this.updateJoinRoles({
            guild_id: message.guild.id,
            joinrole_id: passedRoles[i],
            message
        })
    }
    return message.reply(`Roles saved to Joinroles.`).catch(err => {});
}

module.exports.updateJoinRoles = async ({guild_id, joinrole_id, message}) => {
    if (!joinrole_id) {

        await updateCache({
            cacheName: 'joinroles',
            param_id: [guild_id],
            updateValName: 'role_id',
        })

        return await database.query(`DELETE FROM ${guild_id}_guild_joinroles`)
            .then(() => {
                message.reply(`Joinroles successfully cleared.`).catch(err => {});
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

        return await database.query(`INSERT INTO ${guild_id}_guild_joinroles (role_id) VALUES (?)`, [joinrole_id]).catch(err => {
            return errorhandler({
                err,
                fatal: true
            });
        })
    }
}