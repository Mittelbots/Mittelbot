const { setNewModLogMessage } = require("../../modlog/modlog");
const { privateModResponse } = require("../../privatResponses/privateModResponses");
const { publicModResponses } = require("../../publicResponses/publicModResponses");
const { createInfractionId } = require("../createInfractionId");
const { errorhandler } = require("../errorhandler/errorhandler");
const { getFutureDate } = require("../getFutureDate");
const { insertDataToOpenInfraction } = require("../insertDataToDatabase");

async function banUser(database, member, message, reason, bot, config, log, dbtime, time, isAuto) {

    if(isAuto) mod = bot.user;
    else mod = message.author;

    let infid = createInfractionId(database);
    let pass = false

    if(config.debug == 'true') console.info('Ban Command passed!');
    let x = await member.ban({reason: reason}).then(() => {pass = true}).catch(err => {
        return database.query(`DELETE FROM open_infractions WHERE infraction_id = ?`, [infid]).catch(err => {
            pass = false;
            return errorhandler(err, config.errormessages.databasequeryerror, message.channel, log, config);
        });
    });
    await insertDataToOpenInfraction(member.id, mod.id, 0, 1, getFutureDate(dbtime), reason, infid, message.guild.id, null)
    await setNewModLogMessage(bot, config.defaultModTypes.ban, mod.id,  member.id, reason, time, message.guild.id, database);
    await publicModResponses(message, config.defaultModTypes.ban, mod, member.id, reason, time, bot);
    await privateModResponse(member, config.defaultModTypes.ban, reason, time, bot, message.guild.name)
}

module.exports = {banUser};