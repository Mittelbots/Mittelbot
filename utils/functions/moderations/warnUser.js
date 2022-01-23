const { setNewModLogMessage } = require("../../modlog/modlog");
const { privateModResponse } = require("../../privatResponses/privateModResponses");
const { publicModResponses } = require("../../publicResponses/publicModResponses");
const { createInfractionId } = require("../createInfractionId");
const { errorhandler } = require("../errorhandler/errorhandler");
const { insertDataToClosedInfraction } = require("../insertDataToDatabase");
const { addWarnRoles } = require("../roles/addWarnRoles");

async function warnUser(bot, config, message, member, reason, db, log) {
    try {
        setNewModLogMessage(bot, config.defaultModTypes.warn, message.author.id, member.user.id, reason, null, message.guild.id);
        publicModResponses(message, config.defaultModTypes.warn, message.author.id, member.user.id, reason, null, bot);
        privateModResponse(member, config.defaultModTypes.warn, reason, null, bot);

        let inf_id = createInfractionId()

        insertDataToClosedInfraction(member.id, message.author.id, 0, 0, 1, 0, null, reason, inf_id);
        if(config.debug == 'true') console.info('Warn Command passed!')

        await addWarnRoles(db, message, member, inf_id, config, log)
    }catch(err) {
        return errorhandler(err, config.errormessages.general, message.channel, log, config)
    }  
}
module.exports = {warnUser}