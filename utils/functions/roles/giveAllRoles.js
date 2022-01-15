/**
 * 
 * @param {JSON} user 
 * @param {JSON} guild
 * @param {Array} roles 
 */

const config = require('../../../config.json');

async function giveAllRoles(user, guild, roles) {
    for (let x in roles) {
        let r = await guild.roles.cache.find(role => role.id == roles[x])
        if(config.debug == 'true') console.log(r.name);
        await user.roles.add([await r]);
    }
}

module.exports = {giveAllRoles};