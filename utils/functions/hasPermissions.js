const { Database } = require("../../src/db/db");

const database = new Database();

async function hasPermission(message, adminOnly, modOnly) {
    return database.query(`SELECT * FROM ${message.guild.id}_guild_modroles`).then(async (res) => {
        var hasPermission = false
        for (let i in await res) {
            let roleid = res[i].role_id;
            let admin = res[i].isadmin;
            let mod = res[i].ismod;
            let helper = res[i].ishelper;

            if(adminOnly && message.member.roles.cache.find(r => r.id === roleid) && (mod == 1 || helper == 1)) continue;
            if(modOnly && message.member.roles.cache.find(r => r.id === roleid) && helper == 1) {continue};
            if (message.member.roles.cache.find(r => r.id === roleid)) {
                
                hasPermission = true;
                break;
            }
        }
        return hasPermission;
    }).catch(err => console.log(err))
}

module.exports = {hasPermission}