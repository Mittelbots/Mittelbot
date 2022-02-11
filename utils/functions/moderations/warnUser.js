const { setNewModLogMessage } = require("../../modlog/modlog");
const { privateModResponse } = require("../../privatResponses/privateModResponses");
const { publicModResponses } = require("../../publicResponses/publicModResponses");
const { createInfractionId } = require("../createInfractionId");
const { errorhandler } = require("../errorhandler/errorhandler");
const { insertDataToClosedInfraction } = require("../insertDataToDatabase");
const { addWarnRoles } = require("../roles/addWarnRoles");

async function warnUser(bot, config, message, member, reason, log) {
    try {
        console.log('1')
        await setNewModLogMessage(bot, config.defaultModTypes.warn, message.author.id, member.user.id, reason, null, message.guild.id);
        console.log('2')
        await publicModResponses(message, config.defaultModTypes.warn, message.author.id, member.user.id, reason, null, bot);
        console.log('3')
        await privateModResponse(member, config.defaultModTypes.warn, reason, null, bot, message.guild.name);
        console.log('4')

        let inf_id = createInfractionId()
        console.log('5')

        await insertDataToClosedInfraction(member.id, message.author.id, 0, 0, 1, 0, null, reason, inf_id);
        console.log('6')
        if(config.debug == 'true') console.info('Warn Command passed!')

        console.log('7')
        await addWarnRoles(message, member, inf_id, config, log)
        console.log('8')
    }catch(err) {
        return errorhandler(err, config.errormessages.general, message.channel, log, config)
    }  
}
module.exports = {warnUser}