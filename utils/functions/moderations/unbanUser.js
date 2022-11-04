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
        const query = await database
            .query(`SELECT * FROM open_infractions WHERE user_id AND ban = 1`, [user.id])
            .then(async (res) => {
                if (res.length > 0) {
                    await Infractions.insertClosed({
                        uid: user.id,
                        modid: res[0].mod_id,
                        ban: res[0].ban,
                        mute: res[0].mute,
                        kick: 0,
                        till_date: res[0].till_date,
                        reason: res[0].reason,
                        infraction_id: res[0].infraction_id,
                        start_date: res[0].start_date,
                        guild_id: guild.id,
                    });
                    await Infractions.deleteOpen(res[0].infraction_id);
                }
                return {
                    error: false,
                };
            })
            .catch((err) => {
                errorhandler({ err, fatal: true });
                return {
                    error: true,
                    message: config.errormessages.databasequeryerror,
                };
            });

        if (query.error) return query;

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
            message: `${main_interaction.user.id} has triggered the unban command in ${guild.id}`,
        });

        return p_response;
    }
}

module.exports = { unbanUser };
