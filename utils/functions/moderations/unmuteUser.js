const { setNewModLogMessage } = require('~utils/functions/modlog/modlog');
const { privateModResponse } = require('~utils/functions/privatResponses/privateModResponses');
const { publicModResponses } = require('~utils/functions/publicResponses/publicModResponses');
const { errorhandler } = require('~utils/functions/errorhandler/errorhandler');
const { getMutedRole } = require('~utils/functions/roles/getMutedRole');
const { giveAllRoles } = require('~utils/functions/roles/giveAllRoles');
const config = require('~assets/json/_config/config.json');
const Infractions = require('~utils/classes/Infractions');
const openInfractions = require('~src/db/Models/open_infractions.model');

async function unmuteUser({ user, bot, mod, reason, guild }) {
    const userGuild = await bot.guilds.cache.get(guild.id);
    const MutedRole = await getMutedRole(userGuild);

    const guild_user = userGuild.members.cache.get(user.id);

    let pass = false;

    await guild_user.roles
        .remove(MutedRole)
        .then(() => {
            pass = true;
        })
        .catch((err) => {
            errorhandler({
                err,
            });
        });

    const roles = await openInfractions
        .findOne({
            where: {
                user_id: user.id,
                mute: 1,
            },
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
            });
            return {
                error: true,
                message: global.t.trans(['error.general'], guild.id),
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
        await privateModResponse({
            member: user,
            type: config.defaultModTypes.unmute,
            reason,
            bot,
            guildname: userGuild.name,
        });
        const p_response = await publicModResponses(
            config.defaultModTypes.unmute,
            mod,
            user.id,
            reason,
            null,
            bot
        );

        openInfractions
            .findOne({
                where: {
                    user_id: user.id,
                },
                order: [['id', 'DESC']],
            })
            .then(async (res) => {
                if (res.id) {
                    let user_roles = await await res.user_roles;
                    for (let x in user_roles) {
                        let r = await userGuild.roles.cache.find(
                            (role) => role.id == user_roles[x]
                        );
                        await guild_user.roles.add(r);
                    }
                    await Infractions.insertClosed({
                        uid: res.user_id,
                        mod_id: res.mod_id,
                        mute: res.mute,
                        ban: res.ban,
                        warm: 0,
                        kick: 0,
                        till_date: res.till_date,
                        reason: res.reason,
                        infraction_id: res.infraction_id,
                        start_date: res.start_date,
                        guild_id: guild.id,
                    });
                    await Infractions.deleteOpen(res.infraction_id);

                    errorhandler({
                        fatal: false,
                        message: `${mod.id} has triggered the unmute command in ${guild.id}`,
                        id: 1694433689,
                    });
                }
            })
            .catch((err) => {
                errorhandler({
                    err,
                });
            });

        return p_response;
    }
}

module.exports = {
    unmuteUser,
};
