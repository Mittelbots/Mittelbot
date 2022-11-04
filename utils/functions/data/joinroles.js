const { GuildConfig } = require('./Config');

const _ = require('underscore');

module.exports.removeJoinrole = async ({ guild_id, roles }) => {
    var joinroles = await this.getJoinroles({
        guild_id,
    });

    for (let i in roles) {
        joinroles = joinroles.filter((r) => r !== roles[i]);
    }

    await GuildConfig.update({
        guild_id,
        value: JSON.stringify(joinroles),
        valueName: 'joinroles',
    });
};

module.exports.getJoinroles = async ({ guild_id }) => {
    const guildConfig = await GuildConfig.get(guild_id);
    return guildConfig.joinroles;
};

module.exports.updateJoinroles = async ({ guild, roles, user }) => {
    return new Promise(async (resolve, reject) => {
        var joinroles = await this.getJoinroles({
            guild_id: guild.id,
        });
        const rolesAlreadyExists = _.intersection(joinroles, roles);

        if (rolesAlreadyExists.length > 0) {
            await this.removeJoinrole({
                guild_id: guild.id,
                roles: rolesAlreadyExists,
            });

            for (let i in rolesAlreadyExists) {
                joinroles = joinroles.filter((r) => r !== rolesAlreadyExists[i]);
                roles = roles.filter((r) => r !== rolesAlreadyExists[i]);
            }

            if (joinroles.length == 0) {
                return resolve(`Successfully removed all joinroles`);
            }
        }

        var passedRoles = [];
        for (let i in roles) {
            try {
                var role = guild.roles.cache.get(roles[i]);
                if (role.tags && role.tags.botId) continue;
            } catch (err) {
                return reject(
                    `${roles[i]} doesn't exists! All existing mentions before are saved.`
                );
            }
            try {
                if (!user.roles.cache.find((r) => r.id.toString() === role.id.toString())) {
                    await user.roles.add(role).catch((err) => {});
                    await user.roles.remove(role).catch((err) => {});
                } else {
                    await user.roles.remove(role).catch((err) => {});
                    await user.roles.add(role).catch((err) => {});
                }
            } catch (err) {
                return reject(`I don't have the permission to add this role: **${role}**`);
            }
            passedRoles.push(role.id);
        }
        return await this.saveJoinRoles({
            guild_id: guild.id,
            joinroles: [...passedRoles, ...joinroles],
        })
            .then((res) => {
                resolve(res);
            })
            .catch((err) => {
                reject(err);
            });
    });
};

module.exports.saveJoinRoles = async ({ guild_id, joinroles }) => {
    return new Promise(async (resolve, reject) => {
        await GuildConfig.update({
            guild_id,
            value: joinroles.length > 0 ? JSON.stringify(joinroles) : null,
            valueName: 'joinroles',
        })
            .then(() => {
                if (joinroles.length == 0) {
                    resolve(`Joinroles successfully cleared.`);
                } else {
                    resolve(`Successfully updated all joinroles`);
                }
            })
            .catch(() => {
                reject(
                    `Something went wrong while updating the joinroles config. Please try again later.`
                );
            });
    });
};
