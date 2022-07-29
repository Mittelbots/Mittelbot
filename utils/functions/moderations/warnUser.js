const { setNewModLogMessage } = require("../../modlog/modlog");
const { privateModResponse } = require("../../privatResponses/privateModResponses");
const { publicModResponses } = require("../../publicResponses/publicModResponses");
const { createInfractionId } = require("../createInfractionId");
const { insertDataToClosedInfraction } = require("../insertDataToDatabase");
const { addWarnRoles } = require("../roles/addWarnRoles");
const config = require('../../../src/assets/json/_config/config.json');

async function warnUser({bot, user, mod, guild, reason}) {

    let inf_id = await createInfractionId();
    
    const pass = await addWarnRoles({user, inf_id, guild});

    if(pass.error) return pass;

    if(!pass.error) {
        await setNewModLogMessage(bot, config.defaultModTypes.warn, mod.id, user, reason, null, guild.id);
        const p_response = await publicModResponses(config.defaultModTypes.warn, mod, user.id, reason, null, bot);
        await privateModResponse(user, config.defaultModTypes.warn, reason, null, bot, guild.name);

        await insertDataToClosedInfraction({
            uid: user.id,
            modid: mod.id,
            ban: 0,
            mute: 0,
            warn: 1,
            kick: 0,
            reason,
            infid: inf_id,
        });
            
        if(config.debug == 'true') console.info('Warn Command passed!');

        return p_response;
    }
}
module.exports = {warnUser}