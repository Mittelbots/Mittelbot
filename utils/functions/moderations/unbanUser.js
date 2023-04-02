const { setNewModLogMessage } = require('../../modlog/modlog');
const { publicModResponses } = require('../../publicResponses/publicModResponses');
const { errorhandler } = require('../errorhandler/errorhandler');
const database = require('../../../src/db/db');
const config = require('../../../src/assets/json/_config/config.json');
const { Infractions } = require('../data/Infractions');

async function unbanUser({ user, mod, guild, reason, bot }) {
    let pass = false;

    await guild.members
        .unban(`${user.id}`, `${reason}`)
        .then(() => (pass = true))
        .catch((err) => {
            errorhandler({ err });
            return {
                error: true,
                message: config.errormessages.nopermissions.unban,
            };
        });

    if (pass) {
        const infractions = await Infractions.getOpen({
            user_id: user.id,
            guild_id: guild.id,
        });
        const latestBanInfractions = infractions.filter((infraction) => infraction.ban === 1);

        if (latestBanInfractions.length > 0) {
            await Infractions.insertClosed({
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
            await Infractions.deleteOpen(res[0].infraction_id);
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
            mod.id,
            user,
            reason,
            null,
            bot
        );

        errorhandler({
            fatal: false,
            message: `${user.id} has triggered the unban command in ${guild.id}`,
        });

        return p_response;
    }
}

module.exports = { unbanUser };
