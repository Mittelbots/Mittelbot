const { setNewModLogMessage } = require("../../modlog/modlog");
const { privateModResponse } = require("../../privatResponses/privateModResponses");
const { publicModResponses } = require("../../publicResponses/publicModResponses");
const { createInfractionId } = require("../createInfractionId");
const { addWarnRoles } = require("../roles/addWarnRoles");
const config = require('../../../src/assets/json/_config/config.json');
<<<<<<< HEAD
const { errorhandler } = require('../errorhandler/errorhandler');
const { Infractions } = require('../data/Infractions');
=======
const { insertIntoClosedList } = require("../data/infractions");
const { errorhandler } = require("../errorhandler/errorhandler");

async function warnUser({bot, user, mod, guild, reason}) {
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f

    const inf_id = await createInfractionId(guild.id);
    const pass = await addWarnRoles({user, inf_id, guild});
    if(pass.error) return pass;

<<<<<<< HEAD
    if (pass.error) return;
=======
    if(!pass.error) {
        setNewModLogMessage(bot, config.defaultModTypes.warn, mod.id, user, reason, null, guild.id);
        const p_response = await publicModResponses(config.defaultModTypes.warn, mod, user.id, reason, null, bot);
        if(pass.hasAllRoles) {
            p_response.message.setDescription(`❗️This user has already all warnroles.❗️`)
        }
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f

    setNewModLogMessage(bot, config.defaultModTypes.warn, mod.id, user, reason, null, guild.id);
    const p_response = await publicModResponses(
        config.defaultModTypes.warn,
        mod,
        user.id,
        reason,
        null,
        bot
    );
    if (pass.hasAllRoles) {
        p_response.message.setDescription(`❗️This user has already all warnroles.❗️`);
    }

<<<<<<< HEAD
    await privateModResponse(user, config.defaultModTypes.warn, reason, null, bot, guild.name);

    await Infractions.insertClosed({
        uid: user.id,
        mod_id: mod.id,
        ban: 0,
        mute: 0,
        warn: 1,
        kick: 0,
        reason,
        infraction_id: await createInfractionId(guild.id),
        guild_id: guild.id,
    });

    errorhandler({
        fatal: false,
        message: `${mod.id} has triggered the warn command in ${guild.id}`,
    });
    return p_response;
=======
        await insertIntoClosedList({
            uid: user.id,
            modid: mod.id,
            ban: 0,
            mute: 0,
            warn: 1,
            kick: 0,
            reason,
            infraction_id: await createInfractionId(),
            guild_id: guild.id
        });
        
        errorhandler({fatal: false, message: `${mod.id} has triggered the warn command in ${guild.id}`});
        return p_response;
    }
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f
}
module.exports = {warnUser}