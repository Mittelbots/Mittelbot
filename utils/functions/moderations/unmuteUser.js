const {
    setNewModLogMessage
} = require('../../modlog/modlog');
const {
    privateModResponse
} = require('../../privatResponses/privateModResponses');
const {
    publicModResponses
} = require('../../publicResponses/publicModResponses');
const {
    errorhandler
} = require('../errorhandler/errorhandler');
const {
    getMutedRole
} = require('../roles/getMutedRole');
const {
    giveAllRoles
} = require('../roles/giveAllRoles');
const config = require('../../../src/assets/json/_config/config.json');
const database = require('../../../src/db/db');
const {
    Infractions
} = require('../data/Infractions');
const {
    where
} = require('sequelize');

async function unmuteUser({
    user,
    bot,
    mod,
    reason,
    guild
}) {
    const userGuild = await bot.guilds.cache.get(guild.id);
    var MutedRole = await getMutedRole(userGuild);

    const guild_user = userGuild.members.cache.get(user.id);

    if (!guild_user.roles.cache.has(MutedRole))
        return {
            error: true,
            message: `<@${user.id}> is not muted!`,
        };

    let pass = false;

    await guild_user.roles
        .remove(MutedRole)
        .then(() => {
            pass = true;
        })
        .catch((err) => {
            errorhandler({
                err
            });
            return {
                error: true,
                message: config.errormessages.nopermissions.manageRoles,
            };
        });

    const roles = await database
        .findOne({
            where: {
                user_id: user.id,
                mute: 1
            }
        })
        .then((res) => {
            if (res.length > 0) {
                return {
                    error: false,
                    roles: res[0].user_roles,
                };
            } else {
                return {
                    error: true,
                    roles: null,
                };
            }
        })
        .catch((err) => {
            errorhandler({
                err,
                fatal: true
            });
            return {
                error: true,
                message: config.errormessages.general,
            };
        });

    if (!roles.error) {
        giveAllRoles(user.id, userGuild, roles.roles);
    }

    if (pass) {
        await setNewModLogMessage(
            bot,
            config.defaultModTypes.unmute,
            mod.id,
            user,
            reason,
            null,
            userGuild.id
        );
        await privateModResponse(
            user,
            config.defaultModTypes.unmute,
            reason,
            null,
            bot,
            userGuild.name
        );
        const p_response = await publicModResponses(
            config.defaultModTypes.unmute,
            mod,
            user.id,
            reason,
            null,
            bot
        );

        database.findOne({
                where: {
                    user_id: user.id
                },
                order: [
                    ['id', 'DESC']
                ]
            })
            .then(async (res) => {
                if (res.length > 0) {
                    let user_roles = await await res[0].user_roles
                    for (let x in user_roles) {
                        let r = await userGuild.roles.cache.find(
                            (role) => role.id == user_roles[x]
                        );
                        await guild_user.roles.add(r);
                    }
                    await Infractions.insertClosed({
                        uid: res[0].user_id,
                        mod_id: res[0].mod_id,
                        mute: res[0].mute,
                        ban: res[0].ban,
                        warm: 0,
                        kick: 0,
                        till_date: res[0].till_date,
                        reason: res[0].reason,
                        infraction_id: res[0].infraction_id,
                        start_date: res[0].start_date,
                        guild_id: guild.id,
                    });
                    await Infractions.deleteOpen(res[0].infraction_id);

                    errorhandler({
                        fatal: false,
                        message: `${mod.id} has triggered the unmute command in ${guild.id}`,
                    });
                }
            })
            .catch((err) => {
                errorhandler({
                    err,
                    fatal: true
                });
            });

        return p_response;
    }
}

module.exports = {
    unmuteUser
};