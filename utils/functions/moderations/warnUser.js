const { setNewModLogMessage } = require("../../modlog/modlog");
const { privateModResponse } = require("../../privatResponses/privateModResponses");
const { publicModResponses } = require("../../publicResponses/publicModResponses");
const { createInfractionId } = require("../createInfractionId");
const { errorhandler } = require("../errorhandler/errorhandler");
const { insertDataToClosedInfraction } = require("../insertDataToDatabase");
const { addWarnRoles } = require("../roles/addWarnRoles");

async function warnUser(bot, config, message, member, reason, log) {
    try {
        await setNewModLogMessage(bot, config.defaultModTypes.warn, message.author.id, member.user.id, reason, null, message.guild.id);
        await publicModResponses(message, config.defaultModTypes.warn, message.author, member.user.id, reason, null, bot);
        await privateModResponse(member, config.defaultModTypes.warn, reason, null, bot, message.guild.name);

        let inf_id = await createInfractionId()

        await insertDataToClosedInfraction(member.id, message.author.id, 0, 0, 1, 0, null, reason, inf_id);
    
        await addWarnRoles(message, member, inf_id, config, log);
        if(config.debug == 'true') console.info('Warn Command passed!')
    }catch(err) {
        return errorhandler(err, config.errormessages.general, message.channel, log, config)
    }  
}
module.exports = {warnUser}