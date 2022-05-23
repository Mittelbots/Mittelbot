const { setNewModLogMessage } = require('../../modlog/modlog');
const { privateModResponse } = require('../../privatResponses/privateModResponses');
const { publicModResponses } = require('../../publicResponses/publicModResponses');
const { errorhandler } = require('../errorhandler/errorhandler');
const { insertDataToClosedInfraction } = require('../insertDataToDatabase');
const { getMutedRole } = require('../roles/getMutedRole');
const { removeDataFromOpenInfractions } = require('../removeData/removeDataFromDatabase');
const { giveAllRoles } = require('../roles/giveAllRoles');
const config = require('../../../src/assets/json/_config/config.json');
const database = require('../../../src/db/db');


async function unmuteUser({user, bot, mod, reason, guild}) {
    var MutedRole = await getMutedRole(bot.guilds.cache.get(guild.id));

    const guild_user = guild.members.cache.get(user.id);

    if(!guild_user.roles.cache.has(MutedRole)) return {
        error: true,
        message: `<@${user.id}> is not muted!`
    }

    let pass = false;

    guild_user.roles.remove([MutedRole])
    .then(() => pass = true)
    .catch(err => {
        errorhandler({err});
        return {
            error: true,
            message: config.errormessages.nopermissions.manageRoles
        }
    });

    const roles = await database.query('SELECT user_roles FROM open_infractions WHERE user_id = ? AND mute = ?', [user.id, 1])
        .then(res => {
            return res[0].user_roles
        })
        .catch(err => {
            errorhandler({err, fatal: true})
            return {
                error: true,
                message: config.errormessages.general
            }
        })

    if(!roles.error) {
        await giveAllRoles(user.id, bot.guilds.cache.get(guild.id), JSON.parse(roles))
    }

    if(pass) {
        await setNewModLogMessage(bot, config.defaultModTypes.unmute, mod.id, user, reason, null, guild.id);
        await privateModResponse(user, config.defaultModTypes.unmute, reason, null, bot, guild.name);
        const p_response = await publicModResponses(config.defaultModTypes.unmute, mod, user.id, reason, null, bot);

        await database.query(`SELECT * FROM open_infractions WHERE user_id = ? ORDER BY id DESC`, [user.id]).then(async res => {
            if(res.length > 0) {
                let user_roles = await JSON.parse(await res[0].user_roles);
                for (let x in user_roles) {
                    let r = await guild.roles.cache.find(role => role.id == user_roles[x])
                    await guild_user.roles.add(r);
                }
                await insertDataToClosedInfraction(res[0].user_id, res[0].mod_id, res[0].mute, res[0].ban, 0, 0, res[0].till_date, res[0].reason, res[0].infraction_id);
                await removeDataFromOpenInfractions(res[0].infraction_id);

                if(config.debug == 'true') console.info('Unmute Command passed!')
                
            }
        }).catch(err => console.log(err));

        return p_response;
    }
}

module.exports = {unmuteUser}