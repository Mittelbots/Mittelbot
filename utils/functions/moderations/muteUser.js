const { setNewModLogMessage } = require('../../modlog/modlog');
const { privateModResponse } = require('../../privatResponses/privateModResponses');
const { publicModResponses } = require('../../publicResponses/publicModResponses');
const { createInfractionId } = require('../createInfractionId');
const { errorhandler } = require('../errorhandler/errorhandler');
const { getFutureDate } = require('../getFutureDate');
const { getAllRoles } = require('../roles/getAllRoles');
const { getMutedRole } = require('../roles/getMutedRole');
const { removeAllRoles } = require('../roles/removeAllRoles');
const config = require('../../../src/assets/json/_config/config.json');
const { Infractions } = require('../data/Infractions');

async function muteUser({ user, mod, bot, guild, reason, time, dbtime }) {
    const guild_user = guild.members.cache.get(user.id) || (await guild.members.fetch(user.id));

    const user_roles = getAllRoles(guild_user);
    const mutedRole = await getMutedRole(guild);

    if (!mutedRole) {
        errorhandler({ err, fatal: false, message: `${mutedRole} is not a valid Muted Role.` });
        return {
            error: true,
            message: 'Could not find/create Muted role.',
        };
    }

    const pass = await guild_user.roles
        .add(mutedRole)
        .then(() => {
            return true;
        })
        .catch((err) => {
            if (err.code === 50013) return false;

            errorhandler({
                err,
                fatal: false,
                message: `${mutedRole} is not a valid Muted Role in ${guild.id}`,
            });
            return false;
        });

    if (pass) {
        if (user_roles.length !== 0) await removeAllRoles(guild_user);

        try {
            Infractions.insertOpen({
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
            });

            return p_response;
        } catch (err) {
            errorhandler({ err, fatal: true });
            return {
                error: true,
                message: config.errormessages.general,
            };
        }
    } else {
        return {
            error: true,
            message: config.errormessages.nopermissions.manageRoles,
        };
    }
}

module.exports = {
    muteUser,
};
