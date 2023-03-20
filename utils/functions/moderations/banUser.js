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

        const moduleApi = new Modules();
        if (await moduleApi.checkEnabled(moduleApi.getDefaultSettings().banappeal)) {
            const banappeal = new Banappeal();
            await banappeal
                .createBanappeal(guild.id, user.id)
                .then(async () => {
                    await banappeal.sendBanappealToUser(guild.id, user.id);
                })
                .catch(() => {});
        }

        let pass = false;

        privateModResponse(user, config.defaultModTypes.ban, reason, time, bot, guild.name);

        await guild.members
            .ban(user, {
                deleteMessageSeconds: 60 * 60 * 24 * 7,
                reason: reason,
            })
            .then(() => (pass = true))
            .catch((err) => {
                errorhandler({ err, fatal: false, message: `User-ID: ${user.id}` });
                return reject({
                    error: true,
                    message: config.errormessages.nopermissions.ban,
                });
            });

        if (pass) {
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
        }
    });
}

module.exports = {
    banUser,
};
