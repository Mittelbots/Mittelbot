const database = require("../../src/db/db");
const { errorhandler } = require("./errorhandler/errorhandler");
const { updateCache, addValueToCache, modroles } = require("./cache/cache");

async function insertPermsToModroles(guild_id, role_id, isadmin, ismod, ishelper) {

    addValueToCache({
        cacheName: 'modroles',
        param_id: guild_id,
        value: {
            role_id: role_id,
            isadmin: isadmin,
            ismod: ismod,
            ishelper: ishelper
        },
        valueName: 'modroles'

    })

    database.query(`INSERT INTO ${guild_id}_guild_modroles (role_id, isadmin, ismod, ishelper) VALUES (?, ?, ?, ?)`, [role_id, isadmin, ismod, ishelper])
    .catch(err => {
        return errorhandler({err});
    });
    return;
}

async function updatePermsFromModroles(guild_id, role_id, isadmin, ismod, ishelper) {
    for(let i in modroles) {
        if(modroles[i].guild_id === guild_id) {

            modroles[i][role_id].isadmin = isadmin;
            modroles[i][role_id].ismod = ismod;
            modroles[i][role_id].ishelper = ishelper;
        }
    }

    database.query(`UPDATE ${guild_id}_guild_modroles SET isadmin = ?, ismod = ?, ishelper = ? WHERE role_id = ?`, [isadmin, ismod, ishelper, role_id])
    .catch(err => {
        return errorhandler({err});
    });
    return;
}

async function deletePermsFromModroles(guild_id, role_id) {
    updateCache({
        cacheName: 'modroles',
        param_id: [guild_id, role_id],
        updateValName: 'modroles'
    })
    database.query(`DELETE FROM ${guild_id}_guild_modroles WHERE role_id = ?`, [role_id])
    .catch(err => {
        return errorhandler({err});
    });
    return;
}

module.exports = {
    insertPermsToModroles,
    updatePermsFromModroles,
    deletePermsFromModroles
}