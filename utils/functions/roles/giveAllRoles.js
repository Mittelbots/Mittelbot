/**
 * 
 * @param {JSON} user 
 * @param {JSON} guild
 * @param {Array} roles 
 */

const config = require('../../../config.json');

async function giveAllRoles(user, guild, roles, bot) {
    if(roles.length !== 0) {
        for (let x in roles) {
            try {
                let r = await bot.guilds.cache.get(guild).roles.cache.find(role => role.id == roles[x])
                if(config.debug == 'true') console.log(r.name);
                await bot.guilds.cache.get(guild).members.cache.get(user).roles.add([await r]);
            }catch(err) {
                if(config.debug == 'true') console.log(err);
            }
        }
    }
}

module.exports = {giveAllRoles};