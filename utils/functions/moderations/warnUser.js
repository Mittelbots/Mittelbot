const { setNewModLogMessage } = require('../../modlog/modlog');
const { privateModResponse } = require('../../privatResponses/privateModResponses');
const { publicModResponses } = require('../../publicResponses/publicModResponses');
const { createInfractionId } = require('../createInfractionId');
const { addWarnRoles } = require('../roles/addWarnRoles');
const config = require('../../../src/assets/json/_config/config.json');
const { errorhandler } = require('../errorhandler/errorhandler');
const { Infractions } = require('../data/Infractions');

async function warnUser({ bot, user, mod, guild, reason }) {
    const inf_id = await createInfractionId(guild.id);
    const pass = await addWarnRoles({ user, inf_id, guild });
    if (pass.error) return pass;

    if (pass.error) return;

        
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
}
module.exports = { warnUser };
