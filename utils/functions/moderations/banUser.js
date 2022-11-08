const { setNewModLogMessage } = require('../../modlog/modlog');
const { privateModResponse } = require('../../privatResponses/privateModResponses');
const { publicModResponses } = require('../../publicResponses/publicModResponses');
const { createInfractionId } = require('../createInfractionId');
const { errorhandler } = require('../errorhandler/errorhandler');
const { getFutureDate } = require('../getFutureDate');
const config = require('../../../src/assets/json/_config/config.json');
const { Infractions } = require('../data/Infractions');

async function banUser({ user, mod, guild, reason, bot, dbtime, time, isAuto }) {
    if (isAuto) mod = bot.user;

    let pass = false;

    if (user) {
        privateModResponse(user, config.defaultModTypes.ban, reason, time, bot, guild.name);
        await guild.members
            .ban(user, {
                deleteMessageDays: 7,
                reason: reason,
            })
            .then(() => (pass = true))
            .catch((err) => {
                errorhandler({ err, fatal: false, message: `User-ID: ${user.id}` });
                return {
                    error: true,
                    message: config.errormessages.nopermissions.ban,
                };
            });
    }
    if (pass) {
        Infractions.insertOpen({
            uid: user.id,
            modid: mod.id,
            ban: 1,
            mute: 0,
            till_date: getFutureDate(dbtime),
            reason,
            infraction_id: await createInfractionId(guild.id),
            gid: guild.id,
        });
        setNewModLogMessage(
            bot,
            config.defaultModTypes.ban,
            mod.id,
            user.user || user,
            reason,
            time,
            guild.id
        );
        const p_response = await publicModResponses(
            config.defaultModTypes.ban,
            mod,
            user.id || user,
            reason,
            time,
            bot
        );

        errorhandler({
            fatal: false,
            message: `${mod.id} has triggered the ban command in ${guild.id}`,
        });

        return p_response;
    }
}

module.exports = {
    banUser,
};
