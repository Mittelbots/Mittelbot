const { setNewModLogMessage } = require('~utils/functions/modlog/modlog');
const { publicModResponses } = require('~utils/functions/publicResponses/publicModResponses');
const { errorhandler } = require('~utils/functions/errorhandler/errorhandler');
const config = require('~assets/json/_config/config.json');
const Infractions = require('~utils/classes/Infractions');

function unbanUser({ user, mod, guild, reason, bot }) {
    return new Promise(async (resolve, reject) => {
        await guild.members.unban(`${user.id}`, `${reason}`).catch((err) => {
            errorhandler({ err });
            return reject(global.t.trans(['error.permissions.bot.kick'], guild.id));
        });

        const infractions = await new Infractions().getOpen({
            user_id: user.id,
            guild_id: guild.id,
        });
        const latestBanInfractions = infractions.filter((infraction) => infraction.ban === 1);

        if (latestBanInfractions.length > 0) {
            await new Infractions().insertClosed({
                uid: user.id,
                mod_id: latestBanInfractions[0].mod_id,
                ban: latestBanInfractions[0].ban,
                mute: latestBanInfractions[0].mute,
                kick: 0,
                till_date: latestBanInfractions[0].till_date,
                reason: latestBanInfractions[0].reason,
                infraction_id: latestBanInfractions[0].infraction_id,
                start_date: latestBanInfractions[0].start_date,
                guild_id: guild.id,
            });
            await new Infractions().deleteOpen(latestBanInfractions[0].infraction_id);
        }

        setNewModLogMessage(
            bot,
            config.defaultModTypes.unban,
            mod.id,
            user,
            reason,
            null,
            guild.id
        );
        const p_response = publicModResponses(
            config.defaultModTypes.unban,
            mod,
            user.id,
            reason,
            null,
            bot
        );

        errorhandler({
            fatal: false,
            message: `${user.id} has triggered the unban command in ${guild.id}`,
            id: 1694433672,
        });

        return resolve(p_response);
    });
}

module.exports = { unbanUser };
