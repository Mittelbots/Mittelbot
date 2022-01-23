const { setNewModLogMessage } = require("../../modlog/modlog");
const { privateModResponse } = require("../../privatResponses/privateModResponses");
const { publicModResponses } = require("../../publicResponses/publicModResponses");
const { createInfractionId } = require("../createInfractionId");
const { errorhandler } = require("../errorhandler/errorhandler");
const { getFutureDate } = require("../getFutureDate");
const { insertDataToOpenInfraction } = require("../insertDataToDatabase");

async function banUser(db, member, message, reason, bot, config, log, dbtime, time, isAuto) {

    if(isAuto) mod = bot.user;
    else mod = message.author;

    try {
        let infid = createInfractionId();
        await insertDataToOpenInfraction(member.id, mod.id, 0, 1, getFutureDate(dbtime), reason, createInfractionId(), message.guild.id, null)
        await setNewModLogMessage(bot, config.defaultModTypes.ban, mod.id,  member.id, reason, time, message.guild.id);
        await publicModResponses(message, config.defaultModTypes.ban, mod, member.id, reason, time, bot);
        await privateModResponse(member, config.defaultModTypes.ban, reason, time, bot);
        
        if(config.debug == 'true') console.info('Ban Command passed!');
        member.ban({reason: reason}).catch(err => {
            channel.send(`I can't ban the user! Please check if my Permissions are correct!`);
            db.query(`DELETE FROM open_infractions WHERE infraction_id = ?`, [infid]).catch(err => {
                return errorhandler(err, config.errormessages.databasequeryerror, message.channel, log, config)
            });
        })
    }catch (err) {
        return errorhandler(err, config.errormessages.general, message.channel, log, config)
    }
}

module.exports = {banUser};