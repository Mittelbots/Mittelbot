const { log } = require("../../../logs");
const { setNewModLogMessage } = require("../../modlog/modlog");
const { privateModResponse } = require("../../privatResponses/privateModResponses");
const { publicModResponses } = require("../../publicResponses/publicModResponses");
const { createInfractionId } = require("../createInfractionId");
const { errorhandler } = require("../errorhandler/errorhandler");
const { insertDataToClosedInfraction } = require("../insertDataToDatabase");

async function kickUser(bot, member, message, config, reason) {
    try {

        let pass = false;

        await member.kick({
            reason: reason
        })
        .then(() => pass = true)
        .catch(err => {
            return errorhandler(err, config.errormessages.nopermissions.ban, message.channel, log, config);
        })

        if(pass) {
            insertDataToClosedInfraction(member.id, message.author.id, 0, 0, 0, 1, null, reason, await createInfractionId())
            setNewModLogMessage(bot, config.defaultModTypes.kick, message.author.id, member.id, reason, null, message.guild.id);
            publicModResponses(message, config.defaultModTypes.kick, message.author, member.id, reason, null, bot);
            privateModResponse(member, config.defaultModTypes.kick, reason, null, bot, message.guild.name);
            if(config.debug == 'true') console.info('Kick Command passed!')
        }
    } catch (err) {
        return errorhandler(err, config.errormessages.general, message.channel, log, config, true)
    }
}

module.exports = {kickUser}