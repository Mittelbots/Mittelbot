const { setNewModLogMessage } = require('../../modlog/modlog');
const { privateModResponse } = require('../../privatResponses/privateModResponses');
const { publicModResponses } = require('../../publicResponses/publicModResponses');
const { createInfractionId } = require('../createInfractionId');
const { errorhandler } = require('../errorhandler/errorhandler');
const { getFutureDate } = require('../getFutureDate');
const config = require('../../../src/assets/json/_config/config.json');
const { Infractions } = require('../data/Infractions');
const Banappeal = require('../data/Banappeal');
const Modules = require('../data/Modules');

async function banUser({ user, mod, guild, reason, bot, dbtime, time, isAuto }) {
    return new Promise(async (resolve, reject) => {
        if (isAuto) mod = bot.user;

        const moduleApi = new Modules(guild.id, bot);
        if (await moduleApi.checkEnabled(moduleApi.getDefaultSettings().banappeal.name)) {
            const banappeal = new Banappeal();
            await banappeal
                .createBanappeal(guild.id, user.id || user)
                .then(async () => {
                    await banappeal.sendBanappealToUser(guild.id, user.id || user, bot);
                })
                .catch(() => {});
        }

        privateModResponse({
            member: user,
            type: config.defaultModTypes.ban,
            reason,
            time,
            bot,
            guildname: guild.name,
        });

        await guild.members
            .ban(user, {
                deleteMessageSeconds: 60 * 60 * 24 * 7,
                reason: reason,
            })
            .catch((err) => {
                if (err.status !== 403 && err.status !== 404) {
                    errorhandler({ err });
                }
                return reject(config.errormessages.nopermissions.ban);
            });

        Infractions.insertOpen({
            uid: user.id || user,
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

        return resolve(p_response);
    });
}

module.exports = {
    banUser,
};
