const { log } = require("../../../logs");
const { setNewModLogMessage } = require("../../modlog/modlog");
const { privateModResponse } = require("../../privatResponses/privateModResponses");
const { publicModResponses } = require("../../publicResponses/publicModResponses");
const { createInfractionId } = require("../createInfractionId");
const { errorhandler } = require("../errorhandler/errorhandler");
const { insertDataToClosedInfraction } = require("../insertDataToDatabase");

async function kickUser(bot, member, message, config, reason, database) {
    try {
        insertDataToClosedInfraction(member.id, message.author.id, 0, 0, 0, 1, null, reason, createInfractionId(database))
        await setNewModLogMessage(bot, config.defaultModTypes.kick, message.author.id, member.id, reason, null, message.guild.id, database);
        await publicModResponses(message, config.defaultModTypes.kick, message.author.id, member.id, reason, null, bot);
        await privateModResponse(member, config.defaultModTypes.kick, reason, null, bot, message.guild.name);
        setTimeout(async () => {
            if(config.debug == 'true') console.info('Kick Command passed!')
            return member.kick({
                reason: reason
            });
        }, 500);
    } catch (err) {
        return errorhandler(err, config.errormessages.botnopermission, message.channel, log, config, database)
    }
}

module.exports = {kickUser}