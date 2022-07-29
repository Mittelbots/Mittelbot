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
        privateModResponse(user, config.defaultModTypes.ban, reason, time, bot, guild.name)
        await guild.members.ban(user, {
                days: 7,
                reason: reason
            })
            .then(() => pass = true)
            .catch(err => {
                errorhandler({err, fatal: false});
                return {
                    error: true,
                    message: config.errormessages.nopermissions.ban
                }
            });
    }
    if (pass) {
        insertDataToOpenInfraction({
            uid: user.id,
            modid: mod.id,
            ban: 1,
            mute: 0,
            till_date: getFutureDate(dbtime),
            reason,
            infid,
            gid: guild.id
        })
        setNewModLogMessage(bot, config.defaultModTypes.ban, mod.id, user.user || user, reason, time, guild.id);        
        const p_response = await publicModResponses(config.defaultModTypes.ban, mod, user.id || user, reason, time, bot);

        if (config.debug == 'true') console.info('Ban Command passed!');

        return p_response;
    }


}

module.exports = {
    banUser
};