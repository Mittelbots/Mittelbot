const { setNewModLogMessage } = require('../modlog/modlog');
const { privateModResponse } = require('~utils/functions/privatResponses/privateModResponses');
const { publicModResponses } = require('~utils/functions/publicResponses/publicModResponses');
const { createInfractionId } = require('../createInfractionId');
const { errorhandler } = require('../errorhandler/errorhandler');
const { getFutureDate } = require('../getFutureDate');
const { getAllRoles } = require('../roles/getAllRoles');
const { getMutedRole } = require('../roles/getMutedRole');
const { removeAllRoles } = require('../roles/removeAllRoles');
const config = require('~assets/json/_config/config.json');
const Infractions = require('~utils/classes/Infractions');

async function muteUser({ user, mod, bot, guild, reason, time, dbtime }) {
    return new Promise(async (resolve, reject) => {
        const guild_user = guild.members.cache.get(user.id) || (await guild.members.fetch(user.id));

        const user_roles = getAllRoles(guild_user);
        const mutedRole = await getMutedRole(guild);

        if (!mutedRole) {
            errorhandler({
                fatal: false,
                message: `${mutedRole} is not a valid Muted Role.`,
                id: 1694433644,
            });
            return reject(
                global.t.trans(['error.moderation.mute.noMuteRoleFoundOrCreated'], guild.id)
            );
        }

        await guild_user.roles
            .add(mutedRole)
            .then(() => {
                return true;
            })
            .catch((err) => {
                if (err.code === 50013) {
                    return reject(global.t.trans(['error.permissions.bot.roleAdd'], guild.id));
                }

                errorhandler({
                    fatal: false,
                    message: `${mutedRole} is not a valid Muted Role in ${guild.id} - ${err.message}`,
                    id: 1694433593,
                });
                return reject(
                    global.t.trans(
                        [
                            'error.moderation.mute.notAValidMuteRole',
                            mutedRole,
                            guild.id,
                            err.message,
                        ],
                        guild.id
                    )
                );
            });
        if (user_roles.length !== 0) await removeAllRoles(guild_user);

        try {
            new Infractions().insertOpen({
                uid: user.id,
                modid: mod.id || mod,
                mute: 1,
                ban: 0,
                till_date: getFutureDate(dbtime),
                reason,
                infraction_id: await createInfractionId(guild.id),
                gid: guild.id,
                roles: user_roles,
            });

            setNewModLogMessage(
                bot,
                config.defaultModTypes.mute,
                mod.id || mod,
                user,
                reason,
                time,
                guild.id
            );

            await privateModResponse({
                member: user,
                type: config.defaultModTypes.mute,
                reason,
                time,
                bot,
                guildname: guild.name,
            });

            const p_response = await publicModResponses(
                config.defaultModTypes.mute,
                mod,
                user.id,
                reason,
                time,
                bot
            );

            errorhandler({
                fatal: false,
                message: `${mod.id} has triggered the mute command in ${guild.id}`,
                id: 1694433658,
            });

            return resolve(p_response);
        } catch (err) {
            errorhandler({ err });
            return reject(global.t.trans(['error.general'], guild.id));
        }
    });
}

module.exports = {
    muteUser,
};
