/**
 * 
 * @param {JSON} user 
 * @param {JSON} guild
 * @param {Array} roles 
 */

const { log } = require('../../../logs');
const config = require('../../../src/assets/json/_config/config.json');
const { errorhandler } = require("../errorhandler/errorhandler");

async function giveAllRoles(user, guild, roles, bot) {
    if(roles.length !== 0) {
        for (let x in roles) {
            try {
                let r = await bot.guilds.cache.get(guild.id).roles.cache.find(role => role.id == roles[x])
                if(config.debug == 'true') console.log(r.name);
                await bot.guilds.cache.get(guild.id).members.cache.get(user.id).roles.add([await r]).catch(err => {})
            }catch(err) {
                errorhandler(err, null, null, log, config, true);
            }
        }
    }
}

module.exports = {giveAllRoles};