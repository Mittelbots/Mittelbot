const GuildConfig = require('./Config');
const _ = require('underscore');

class Joinroles {
    constructor() {}

    get({ guild_id }) {
        return new Promise(async (resolve) => {
            const guild = await new GuildConfig().get(guild_id);
            return resolve(guild.joinroles);
        });
    }

    update({ guild, roles, user }) {
        return new Promise(async (resolve, reject) => {
            const guildConfig = await new GuildConfig().get(guild.id);
            let joinroles = guildConfig.joinroles;

            const rolesAlreadyExists = _.intersection(joinroles, roles);
            if (rolesAlreadyExists.length > 0) {
                await this.remove({
                    guild_id: guild.id,
                    roles: rolesAlreadyExists,
                }).catch((err) => {
                    return reject(err);
                });

                for (let i in rolesAlreadyExists) {
                    joinroles = joinroles.filter((r) => r !== rolesAlreadyExists[i]);
                    roles = roles.filter((r) => r !== rolesAlreadyExists[i]);
                }

                if (joinroles.length === 0) {
                    return resolve(
                        global.t.trans(['success.admin.joinroles.removedAll'], guild.id)
                    );
                }
            }
            let passedRoles = [];
            for (let i in roles) {
                let role;
                try {
                    role = guild.roles.cache.get(roles[i]);
                    if (role.tags && role.tags.botId) continue;
                } catch (err) {
                    return reject(
                        global.t.trans(['error.admin.joinroles.notExists', roles[i]], guild.id)
                    );
                }
                try {
                    if (!user.roles.cache.find((r) => r.id.toString() === role.id.toString())) {
                        await user.roles.add(role).catch(() => {});
                        await user.roles.remove(role).catch(() => {});
                    } else {
                        await user.roles.remove(role).catch(() => {});
                        await user.roles.add(role).catch(() => {});
                    }
                } catch (err) {
                    return reject(
                        global.t.trans(['error.permissions.bot.roleAddSpecific', role], guild.id)
                    );
                }
                passedRoles.push(role.id);
            }

            return await new GuildConfig()
                .update({
                    guild_id: guild.id,
                    value: [...passedRoles, ...joinroles],
                    valueName: 'joinroles',
                })
                .then(() => {
                    if (joinroles.length === 0 && passedRoles.length === 0) {
                        resolve(global.t.trans(['success.admin.joinroles.cleared'], guild.id));
                    } else {
                        resolve(global.t.trans(['success.admin.joinroles.updated'], guild.id));
                    }
                })
                .catch(() => {
                    reject(global.t.trans(['error.general'], guild.id));
                });
        });
    }

    remove({ guild_id, roles }) {
        return new Promise(async (resolve, reject) => {
            let joinroles = await this.get({
                guild_id,
            });

            for (let i in roles) {
                joinroles = joinroles.filter((r) => r !== roles[i]);
            }

            await new GuildConfig()
                .update({
                    guild_id,
                    value: joinroles,
                    valueName: 'joinroles',
                })
                .then(() => {
                    resolve(global.t.trans(['success.admin.joinroles.removedAll'], guild_id));
                })
                .catch(() => {
                    reject(global.t.trans(['error.general'], guild_id));
                });
        });
    }
}

module.exports = Joinroles;
