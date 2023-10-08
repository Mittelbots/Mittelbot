const { setNewModLogMessage } = require('../modlog/modlog');
const { privateModResponse } = require('~utils/functions/privatResponses/privateModResponses');
const { publicModResponses } = require('~utils/functions/publicResponses/publicModResponses');
const { createInfractionId } = require('../createInfractionId');
const { addWarnRoles } = require('../roles/addWarnRoles');
const config = require('~assets/json/_config/config.json');
const { errorhandler } = require('~utils/functions/errorhandler/errorhandler');
const Infractions = require('~utils/classes/Infractions');
const Modules = require('~utils/classes/Modules');

async function warnUser({ bot, user, mod, guild, reason }) {
    const inf_id = await createInfractionId(guild.id);

    const moduleApi = new Modules(guild.id, bot);
    let warnroles;
    if (await moduleApi.checkEnabled(moduleApi.getDefaultSettings().warnroles.name)) {
        warnroles = await addWarnRoles({ user, inf_id, guild });
        if (warnroles.error) return warnroles;
    }

    setNewModLogMessage(bot, config.defaultModTypes.warn, mod.id, user, reason, null, guild.id);
    const p_response = await publicModResponses(
        config.defaultModTypes.warn,
        mod,
        user.id,
        reason,
        null,
        bot
    );
    if (warnroles && warnroles.hasAllRoles) {
        p_response.message.setDescription(
            global.t.trans(['info.moderation.warn.hasAllWarnRoles'], guild.id)
        );
    }

    await privateModResponse({
        member: user,
        type: config.defaultModTypes.warn,
        reason,
        bot,
        guildname: guild.name,
    });

    await new Infractions().insertClosed({
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
        id: 1694433700,
    });
    return p_response;
}
module.exports = { warnUser };
