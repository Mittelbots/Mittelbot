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
const config = require('../../../src/assets/json/_config/config.json');

async function banUser({user, mod, guild, reason, bot, dbtime, time, isAuto}) {
    if (isAuto) mod = bot.user;

    let infid = await createInfractionId();

    let pass = false;

    if (user) {
        await guild.members.ban(user, {
                days: 7,
                reason: reason
            })
            .then(() => pass = true)
            .catch(err => {
                errorhandler(err);
                return {
                    error: true,
                    message: config.errormessages.nopermissions.ban
                }
            });
    }
    if (pass) {
       
        insertDataToOpenInfraction(user.id, mod.id, 0, 1, getFutureDate(dbtime), reason, infid, guild.id, null)
        setNewModLogMessage(bot, config.defaultModTypes.ban, mod.id, user.user || user, reason, time, guild.id);        
        privateModResponse(user, config.defaultModTypes.ban, reason, time, bot, guild.name)
        const p_response = await publicModResponses(config.defaultModTypes.ban, mod, user.id || user, reason, time, bot);

        if (config.debug == 'true') console.info('Ban Command passed!');

        return p_response;
    }


}

module.exports = {
    banUser
};