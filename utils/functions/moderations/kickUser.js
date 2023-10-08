const { setNewModLogMessage } = require('~utils/functions/modlog/modlog');
const { privateModResponse } = require('~utils/functions/privatResponses/privateModResponses');
const { publicModResponses } = require('~utils/functions/publicResponses/publicModResponses');
const { createInfractionId } = require('../createInfractionId');
const config = require('~assets/json/_config/config.json');
const { errorhandler } = require('~utils/functions/errorhandler/errorhandler');
const Infractions = require('~utils/classes/Infractions');

module.exports.kickUser = ({ user, mod, guild, reason, bot }) => {
    return new Promise(async (resolve, reject) => {
        let pass = false;

        privateModResponse({
            member: user,
            type: config.defaultModTypes.kick,
            reason,
            bot,
            guildname: guild.name,
        });

        await guild.members
            .kick(user, {
                reason: reason,
            })
            .then(() => (pass = true))
            .catch((err) => (pass = false));

        if (pass) {
            new Infractions().insertClosed({
                uid: user.id,
                mod_id: mod.id,
                ban: 0,
                mute: 0,
                warn: 0,
                kick: 0,
                reason,
                infraction_id: await createInfractionId(guild.id),
                guild_id: guild.id,
            });
            setNewModLogMessage(
                bot,
                config.defaultModTypes.kick,
                mod.id,
                user,
                reason,
                null,
                guild.id
            );
            const p_response = await publicModResponses(
                config.defaultModTypes.kick,
                mod,
                user.id,
                reason,
                null,
                bot
            );
            errorhandler({
                fatal: false,
                message: `${mod.id} has triggered the kick command in ${guild.id}`,
                id: 1694433580,
            });

            return resolve(p_response.message);
        } else {
            return reject(global.t.trans(['error.permissions.bot.kick'], guild.id));
        }
    });
};
