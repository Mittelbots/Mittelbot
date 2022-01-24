const { setNewModLogMessage } = require('../../modlog/modlog');
const { privateModResponse } = require('../../privatResponses/privateModResponses');
const { publicModResponses } = require('../../publicResponses/publicModResponses');
const { errorhandler } = require('../errorhandler/errorhandler');
const { insertDataToClosedInfraction } = require('../insertDataToDatabase');
const { getMutedRole } = require('../roles/getMutedRole');
const { removeDataFromOpenInfractions } = require('../data/removeDataFromDatabase');


async function unmuteUser(db, message, member, bot, config, reason, log) {
    var MutedRole = await getMutedRole(message);

    if(!member.roles.cache.has(MutedRole)) return message.channel.send(`<@${message.author.id}> The user isnt't muted.`)

    try {
        setNewModLogMessage(bot, config.defaultModTypes.unmute, message.author.id, member.id, reason, null, message.guild.id);
        publicModResponses(message, config.defaultModTypes.unmute, message.author.id, member.id, reason, null, bot);
        privateModResponse(member, config.defaultModTypes.unmute, reason, null, bot, message.guild.name);
        db.query(`SELECT * FROM open_infractions WHERE user_id = ? ORDER BY id DESC`, [member.id]).then(async res => {
            let user_roles = await JSON.parse(await res[0].user_roles);
            for (let x in user_roles) {
                let r = await message.guild.roles.cache.find(role => role.id == user_roles[x])
                await member.roles.add(r);
            }
            await insertDataToClosedInfraction(res[0].user_id, res[0].mod_id, res[0].mute, res[0].ban, 0, 0, res[0].till_date, res[0].reason, res[0].infraction_id);
            await removeDataFromOpenInfractions(db, res[0].infraction_id);

            if(config.debug == 'true') console.info('Unmute Command passed!')

            return await member.roles.remove([MutedRole]);
        }).catch(err => console.log(err))
    }
    catch(err) {
        errorhandler(err, config.errormessages.general, message.channel, log, config)
        log.warn(err);
        if(config.debug == 'true') console.log(err);
        message.channel.send()
    }
}

module.exports = {unmuteUser}