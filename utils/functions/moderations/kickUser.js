const { setNewModLogMessage } = require("../../modlog/modlog");
const { privateModResponse } = require("../../privatResponses/privateModResponses");
const { publicModResponses } = require("../../publicResponses/publicModResponses");
const { createInfractionId } = require("../createInfractionId");
const config = require('../../../src/assets/json/_config/config.json');
<<<<<<< HEAD
const { errorhandler } = require('../errorhandler/errorhandler');
const { Infractions } = require('../data/Infractions');
=======
const { getCurrentFullDate } = require("../data/dates");
const { insertIntoClosedList } = require("../data/infractions");
const { errorhandler } = require("../errorhandler/errorhandler");
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f

module.exports.kickUser = ({user, mod, guild, reason, bot}) => {
    return new Promise(async (resolve, reject) => {
        let pass = false;

        privateModResponse(user, config.defaultModTypes.kick, reason, null, bot, guild.name);
        await guild.members.kick(user, {
            reason: reason
        })
        .then(() => pass = true)
        .catch(err => pass = false)

<<<<<<< HEAD
        if (pass) {
            Infractions.insertClosed({
=======
        if(pass) {
            insertIntoClosedList({
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f
                uid: user.id,
                mod_id: mod.id,
                ban: 0,
                mute: 0,
                warn: 0,
                kick: 0,
                reason,
<<<<<<< HEAD
                infraction_id: await createInfractionId(guild.id),
                guild_id: guild.id,
            });
            setNewModLogMessage(
                bot,
                config.defaultModTypes.kick,
                mod.id,
                user,
                reason,
                null,
                guild.id
            );
            const p_response = await publicModResponses(
                config.defaultModTypes.kick,
                mod,
                user.id,
                reason,
                null,
                bot
            );
            errorhandler({
                fatal: false,
                message: `${mod.id} has triggered the kick command in ${guild.id}`,
            });

=======
                infraction_id: await createInfractionId(),
                start_date: getCurrentFullDate(),
                guild_id: guild.id
            })
            setNewModLogMessage(bot, config.defaultModTypes.kick, mod.id, user, reason, null, guild.id);
            const p_response = await publicModResponses(config.defaultModTypes.kick, mod, user.id, reason, null, bot);
            errorhandler({fatal: false, message: `${mod.id} has triggered the kick command in ${guild.id}`});
            
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f
            return resolve(p_response);
        }else {
            return reject(config.errormessages.nopermissions.kick);
        }
    })
}