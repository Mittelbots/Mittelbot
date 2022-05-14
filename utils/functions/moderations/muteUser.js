
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
const config = require('../../../src/assets/json/_config/config.json');

async function muteUser({user, mod, bot, guild, reason, time, dbtime}) {
    const guild_user = guild.members.cache.get(user.id);
    
    var user_roles = await getAllRoles(guild_user);
    var MutedRole = await getMutedRole(guild);

    let pass = false;

    await guild_user.roles.add(MutedRole)
    .then(() => pass = true)
    .catch(err => {
        errorhandler({err});
        return {
            error: true,
            message: config.errormessages.nopermissions.manageRoles
        }
    });

    if(pass) {
        if(user_roles.length !== 0) await removeAllRoles(guild_user);

        if (guild_user.roles.cache.has(MutedRole)) {
            try {
                await insertDataToOpenInfraction(user.id, mod.id, 1, 0, getFutureDate(dbtime), reason, await createInfractionId(), guild.id, JSON.stringify(user_roles))
                await setNewModLogMessage(bot, config.defaultModTypes.mute, mod.id, user, reason, time, guild.id);
                await privateModResponse(user, config.defaultModTypes.mute, reason, time, bot, guild.name);
                const p_response = await publicModResponses(config.defaultModTypes.mute, mod, user.id, reason, time, bot);

                return p_response;

            } catch (err) {
                errorhandler({err, fatal: true});
                return {
                    error: true,
                    message: config.errormessages.general
                }
            }
        }
    }
}

module.exports = {
    muteUser
}