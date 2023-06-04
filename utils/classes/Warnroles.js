const { checkRole } = require('~utils/functions/roles/checkRole');
const GuildConfig = require('./Config');

class Warnroles {
    constructor() {}

    get(guild_id) {
        return new Promise(async (resolve, reject) => {
            const guildConfig = await new GuildConfig().get(guild_id);
            return guildConfig.warnroles ? resolve(guildConfig.warnroles) : reject(false);
        });
    }

    add({ guild_id, warnrole_id }) {
        return new Promise(async (resolve, reject) => {
            const warnroles = await this.get(guild_id);

            warnroles.push(warnrole_id);

            return await new GuildConfig()
                .update({
                    guild_id,
                    value: warnroles,
                    valueName: 'warnroles',
                })
                .then(() => {
                    return resolve(true);
                })
                .catch((err) => {
                    return reject(false);
                });
        });
    }

    remove({ guild_id, warnrole_id }) {
        return new Promise(async (resolve, reject) => {
            const warnroles = await this.get(guild_id);
            const newWarnroles = warnroles.filter((role) => role !== warnrole_id);

            return await new GuildConfig()
                .update({
                    guild_id,
                    value: newWarnroles,
                    valueName: 'warnroles',
                })
                .then(() => {
                    return true;
                })
                .catch((err) => {
                    return false;
                });
        });
    }

    update({ guild, roles, user }) {
        return new Promise(async (resolve, reject) => {
            const warnroles = await this.get(guild.id);

            if (warnroles && warnroles.length !== 0) {
                let removedRoles = '';
                for (let i in roles) {
                    const checkedRoles = await checkRole({
                        guild: guild,
                        role_id: roles[i],
                    });

                    if (!checkedRoles) {
                        return reject(
                            `❌ ${roles[i]} doesn't exists! All existing mentions before are saved.`
                        );
                    }

                    //check if warnroles already exists
                    for (let w in warnroles) {
                        if (roles[i] === warnroles[w]) {
                            const removed = this.remove({
                                guild_id: guild.id,
                                warnrole_id: roles[i],
                            });

                            if (removed.error) {
                                return reject(removed.message);
                            } else {
                                removedRoles += `<@&${roles[i]}> `;
                                delete roles[i];
                            }
                        }
                    }
                }
                if (removedRoles !== '') {
                    return reject(`Removed ${removedRoles}`);
                }
            }

            for (let i in roles) {
                const checkedRoles = await checkRole({
                    guild: guild,
                    role_id: roles[i],
                });

                if (!checkedRoles) {
                    return reject(
                        `❌ ${roles[i]} doesn't exists! All existing mentions before are saved.`
                    );
                }

                //guild.me doesnt work for some reasons
                try {
                    if (!user.roles.cache.find((r) => r.id.toString() === roles[i].toString())) {
                        await user.roles.add(roles[i]).catch((err) => {});
                        user.roles.remove(roles[i]).catch((err) => {});
                    } else {
                        await user.roles.remove(roles[i]).catch((err) => {});
                        user.roles.add(roles[i]).catch((err) => {});
                    }
                } catch (err) {
                    return reject(
                        `❌ I don't have the permission to add this role: **<@&${roles[i]}>**`
                    );
                }
            }
            for (let i in roles) {
                await this.add({
                    guild_id: guild.id,
                    warnrole_id: roles[i],
                });
            }
            return resolve(true);
        });
    }
}

module.exports = Warnroles;
