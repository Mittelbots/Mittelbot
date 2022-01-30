const { Database } = require("../../src/db/db");
const { errorhandler } = require("./errorhandler/errorhandler");

const database = new Database;

async function insertDataToClosedInfraction (uid, modid, mute, ban, warn, kick, till_date, reason, infraction_id) {
    database.query('INSERT INTO closed_infractions (user_id, mod_id, mute, ban, warn, kick, till_date, reason, infraction_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',[uid, modid, mute, ban, warn, kick, till_date, reason, infraction_id]).catch(err => console.log(err));
    return;
}

async function insertDataToOpenInfraction (uid, modid, mute, ban, till_date, reason, infraction_id, gid, roles) {
    database.query('INSERT INTO open_infractions (user_id, mod_id, mute, ban, till_date, reason, infraction_id, guild_id, user_roles) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',[uid, modid, mute, ban, till_date, reason, infraction_id, gid, roles]).catch(err => console.log(err));
    return;
}

async function insertDataToTemproles (uid, role_id, till_date, infraction_id, gid) {
    database.query('INSERT INTO temproles (user_id, role_id, till_date, infraction_id, guild_id) VALUES (?, ?, ?, ?, ?)', [uid, role_id, till_date, infraction_id, gid]).catch(err => console.log(err));
    return;
}

async function insertPermsToModroles(guild_id, role_id, isadmin, ismod, ishelper) {
    database.query(`INSERT INTO ${guild_id}_guild_modroles (role_id, isadmin, ismod, ishelper) VALUES (?, ?, ?, ?)`, [role_id, isadmin, ismod, ishelper]).catch(err => console.log(err));
    return;
}

async function updatePermsFromModroles(guild_id, role_id, isadmin, ismod, ishelper) {
    database.query(`UPDATE ${guild_id}_guild_modroles SET isadmin = ?, ismod = ?, ishelper = ? WHERE role_id = ?`, [isadmin, ismod, ishelper, role_id]).catch(err => console.log(err))
    return;
}

async function deletePermsFromModroles(guild_id, role_id) {
    database.query(`DELETE FROM ${guild_id}_guild_modroles WHERE role_id = ?`, [role_id]).catch(err => console.log(err))
    return;
}

module.exports = {
    insertDataToClosedInfraction,
    insertDataToOpenInfraction,
    insertDataToTemproles,
    insertPermsToModroles,
    updatePermsFromModroles,
    deletePermsFromModroles
}