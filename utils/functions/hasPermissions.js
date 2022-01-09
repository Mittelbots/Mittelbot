async function hasPermission(message, adminOnly, modOnly) {
    const {Database} = require('../../src/db/db');
    const database = new Database();
    var modroles;

    return database.query(`SELECT * FROM ${message.guild.id}_guild_modroles`).then(async (res) => {
        var hasPermission = false
        modroles = await res;
        for (let i in modroles) {
            let roleid = modroles[i].role_id;
            let admin = modroles[i].isadmin;
            let mod = modroles[i].ismod;
            let helper = modroles[i].ishelper;

            if(adminOnly && message.member.roles.cache.find(r => r.id === roleid) && mod == 1 || helper == 1) continue;
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