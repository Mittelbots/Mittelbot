const database = require("../../src/db/db");
const { errorhandler } = require("./errorhandler/errorhandler");


async function isMod({member, guild}) {
    if(!member) return false;
    
    return await database.query(`SELECT * FROM ${guild.id}_guild_modroles`).then(async (res) => {
        var isMod = false
        for (let i in await res) {
            if(member.roles.cache.find(r => r.id === res[i].role_id) !== undefined) {
                isMod = true;
                break;
            }
        }
        return isMod;
    }).catch(err => {
        errorhandler({err, fatal:true});
        return true;
    })
}

module.exports = {isMod}