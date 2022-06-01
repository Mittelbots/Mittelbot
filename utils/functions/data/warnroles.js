const database = require("../../../src/db/db");
const { errorhandler } = require("../errorhandler/errorhandler");
const { getAllGuildIds } = require("./getAllGuildIds");
const config = require('../../../src/assets/json/_config/config.json');
const { updateCache, addValueToCache, getFromCache } = require("../cache/cache");
const { checkRole } = require("../roles/checkRole");

module.exports.getAllWarnroles = async () => {

    const all_guild_id = await getAllGuildIds();

    if(all_guild_id) {
        let response = [];
        for(let i in all_guild_id) {
            const obj = {
                guild_id: all_guild_id[i].guild_id,
                warnroles: await this.getWarnroles({guild_id: all_guild_id[i].guild_id})
            }
            response.push(obj);
        }
        return response;
    }else {
        return false;
    }
}

module.exports.getWarnroles = async ({guild_id}) => {
    return await database.query(`SELECT * FROM ${guild_id}_guild_warnroles`)
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


module.exports.addWarnroles = async ({guild_id, warnrole_id}) => {
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

module.exports.removeWarnroles = ({guild_id, warnrole_id}) => {

    updateCache({
        cacheName: `warnroles`,
        param_id: [guild_id, warnrole_id],
        updateValName: `roles`
    })

    return database.query(`DELETE FROM ${guild_id}_guild_warnroles WHERE role_id = ?`, [warnrole_id])
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
            message: "An error occured while removing the warnrole"
        }
    });
}


module.exports.updateWarnroles = async ({guild_id, roles, message}) => {
    const cache = await getFromCache({
        cacheName: 'warnroles',
        param_id: guild_id
    });

    if (cache[0].roles !== undefined && cache[0].roles.length !== 0) {
        const cacheRoles = cache[0].roles;
        
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
                    let removed = this.removeWarnroles({
                        guild_id: guild_id,
                        warnrole_id: roles[i],
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
    }

    for (let i in roles) {
        const checkedRoles = await checkRole({
            guild: message.guild,
            role_id: roles[i]
        });

        if(!checkedRoles) {
            return message.reply(`${roles[i]} doesn't exists! All existing mentions before are saved.`).catch(err => {});
        }

        try {
            if (!message.member.roles.cache.find(r => r.id.toString() === roles[i].toString())) {
                await message.member.roles.add(roles[i]).catch(err => {});
                message.member.roles.remove(roles[i]).catch(err => {});
            } else {
                await message.member.roles.remove(roles[i]).catch(err => {});
                message.member.roles.add(roles[i]).catch(err => {});
            }
        } catch (err) {
            console.log(err)
            return message.reply(`I don't have the permission to add this role: **<@&${roles[i]}>**`).catch(err => {});
        }
    }
    for (let i in roles) {
        const added = await this.addWarnroles({
            guild_id: guild_id,
            warnrole_id: roles[i]
        })

        if(added.error) {
            return message.reply(added.message).catch(err => {});
        }else {
            await addValueToCache({
                cacheName: 'warnroles',
                param_id: guild_id,
                value: roles[i],
                valueName: 'roles'
            });

            const cache = await getFromCache({
                cacheName: 'warnroles',
                param_id: guild_id
            })

            console.log(cache[0].roles)
        }
    }
    return message.reply(`Warn roles successfully saved!`).catch(err => {});
}