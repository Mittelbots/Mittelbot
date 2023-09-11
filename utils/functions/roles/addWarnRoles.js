const { errorhandler } = require('../errorhandler/errorhandler');
const { getFutureDate } = require('../getFutureDate');
const Temproles = require('~utils/classes/Temproles');
const Warnroles = require('~utils/classes/Warnroles');

module.exports.addWarnRoles = async ({ user, inf_id, guild }) => {
    const roles = await new Warnroles().get(guild.id);

    let hasRoleAlready = false;
    if (roles.length > 0) {
        for (let i in roles) {
            let role = await guild.roles.cache.find((role) => role.id === roles[i]).id;
            const guild_user = await guild.members.cache.get(user.id);
            if (guild_user) {
                if (!guild_user.roles.cache.has(role)) {
                    return await guild_user.roles
                        .add([role])
                        .then(() => {
                            errorhandler({
                                fatal: false,
                                message: `${user.id} has got a warn roles in ${guild.id}`,
                                id: 1694433710,
                            });
                            new Temproles().insert({
                                uid: user.id,
                                role_id: roles[i],
                                till_date: getFutureDate(2678400),
                                infraction_id: inf_id,
                                gid: guild.id,
                            });
                            return true;
                        })
                        .catch(() => {
                            return {
                                error: true,
                                message: global.t.trans(
                                    ['error.permissions.bot.managRoles'],
                                    guild.id
                                ),
                            };
                        });
                } else {
                    hasRoleAlready = true;
                }
            }
        }
        if (hasRoleAlready) {
            //If User already have all Roles
            errorhandler({
                fatal: false,
                message: `${user.id} has already all roles ${guild.id}`,
                id: 1694433720,
            });

            return {
                error: false,
                hasAllRoles: true,
                message: 'This User already have all warn roles!',
            };
        }
    } else {
        return true;
    }
};
