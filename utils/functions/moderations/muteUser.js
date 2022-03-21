const { log } = require("../../../logs");
const { setNewModLogMessage } = require("../../modlog/modlog");
const { privateModResponse } = require("../../privatResponses/privateModResponses");
const { publicModResponses } = require("../../publicResponses/publicModResponses");
const { createInfractionId } = require("../createInfractionId");
const { errorhandler } = require("../errorhandler/errorhandler");
const { getFutureDate } = require("../getFutureDate");
const { insertDataToOpenInfraction } = require("../insertDataToDatabase");
const { getAllRoles } = require("../roles/getAllRoles");
const { getMutedRole } = require("../roles/getMutedRole");
const { removeAllRoles } = require("../roles/removeAllRoles");

async function muteUser(Member, message, bot, config, reason, time, dbtime) {
    var user_roles = await getAllRoles(Member);
    var MutedRole = await getMutedRole(message, message.guild);

    await Member.roles.add(MutedRole).catch(err => { return message.channel.send(`I don't have permissions to do this task!`)});

    if(user_roles.length !== 0) await removeAllRoles(Member);

    if (Member.roles.cache.has(MutedRole)) {
        try {
            await insertDataToOpenInfraction(Member.id, message.author.id, 1, 0, getFutureDate(dbtime, time), reason, await createInfractionId(), message.guild.id, JSON.stringify(user_roles))
            await setNewModLogMessage(bot, config.defaultModTypes.mute, message.author.id, Member.id, reason, time, message.guild.id);
            await publicModResponses(message, config.defaultModTypes.mute, message.author, Member.id, reason, time, bot);
            await privateModResponse(Member, config.defaultModTypes.mute, reason, time, bot, message.guild.name);
            return true;
        } catch (err) {
            return errorhandler(err, config.errormessages.general, message.channel, log, config)
        }
    }
}

module.exports = {
    muteUser
}