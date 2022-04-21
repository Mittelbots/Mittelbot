const {
    setNewModLogMessage
} = require("../../modlog/modlog");
const {
    privateModResponse
} = require("../../privatResponses/privateModResponses");
const {
    publicModResponses
} = require("../../publicResponses/publicModResponses");
const {
    createInfractionId
} = require("../createInfractionId");
const {
    errorhandler
} = require("../errorhandler/errorhandler");
const {
    getFutureDate
} = require("../getFutureDate");
const {
    insertDataToOpenInfraction
} = require("../insertDataToDatabase");
const database = require('../../../src/db/db');



async function banUser(member, message, reason, bot, config, log, dbtime, time, isAuto) {

    if (isAuto) mod = bot.user;
    else mod = message.author;

    let infid = await createInfractionId();

    let pass = false;

    await member.ban({
            days: 7,
            reason: reason
        })
        .then(() => pass = true)
        .catch(async err => {
            return errorhandler(err, config.errormessages.nopermissions.ban, message.channel, log, config);
        });

    if (pass) {
        insertDataToOpenInfraction(member.id, mod.id, 0, 1, getFutureDate(dbtime), reason, infid, message.guild.id, null)
        setNewModLogMessage(bot, config.defaultModTypes.ban, mod.id, member.id, reason, time, message.guild.id);
        publicModResponses(message, config.defaultModTypes.ban, mod, member.id, reason, time, bot);
        privateModResponse(member, config.defaultModTypes.ban, reason, time, bot, message.guild.name)

        if (config.debug == 'true') console.info('Ban Command passed!');
    }


}

module.exports = {
    banUser
};