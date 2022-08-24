/**
 * 
 * @param {JSON} user 
 * @param {JSON} guild
 * @param {Array} roles 
 */

const { log } = require('../../../logs');
const config = require('../../../src/assets/json/_config/config.json');
const { errorhandler } = require("../errorhandler/errorhandler");

async function giveAllRoles(userId, guild, roles) {
    if(roles.length !== 0) {
        for (let x in roles) {
            try {
                let r = await guild.roles.cache.find(role => role.id == roles[x])
                errorhandler({fatal: false, message: `${userId} was given the roles back in ${guild.id}. ROLEID: ${roles[x]}`});
                await guild.members.cache.get(userId).roles.add([await r]).catch(err => {})
            }catch(err) {
                return errorhandler({err, fatal: true});
            }
        }
    }
}

module.exports = {giveAllRoles};