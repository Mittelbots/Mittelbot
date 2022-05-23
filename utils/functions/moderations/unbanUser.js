const { setNewModLogMessage } = require("../../modlog/modlog");
const { publicModResponses } = require("../../publicResponses/publicModResponses");
const { removeDataFromOpenInfractions } = require("../removeData/removeDataFromDatabase");
const { errorhandler } = require("../errorhandler/errorhandler");
const { insertDataToClosedInfraction } = require("../insertDataToDatabase");
const database = require('../../../src/db/db');
const config = require('../../../src/assets/json/_config/config.json');


async function unbanUser({user, mod, guild, reason, bot}) {

    let pass = false;

    await guild.members.unban(`${user.id}`, `${reason}`)
    .then(() => pass = true)
    .catch(err =>{
        errorhandler({err})
        return {
            error: true,
            message: config.errormessages.nopermissions.unban
        }
    })

    if(pass) {
        const query = await database.query(`SELECT * FROM open_infractions WHERE user_id AND ban = 1`, [user.id]).then(async res => {
            if(res.length > 0) {
                await insertDataToClosedInfraction(user, res[0].mod_id, res[0].mute, res[0].ban, 0, 0, res[0].till_date, res[0].reason, res[0].infraction_id)
                await removeDataFromOpenInfractions(res[0].infraction_id)
            }
            return {
                error: false
            }
        }).catch(err => {
            errorhandler({err, fatal: true});
            return {
                error: true,
                message: config.errormessages.databasequeryerror
            }
        });

        if(query.error) return query;

        setNewModLogMessage(bot, config.defaultModTypes.unban, mod.id, user, reason, null, guild.id);
        const p_response = publicModResponses(config.defaultModTypes.unban, mod.id, user, reason, null, bot);

        if(config.debug == 'true') console.info('Ban Command passed!')

        return p_response;
    }
}


module.exports = {unbanUser}