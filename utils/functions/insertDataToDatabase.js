const { Database } = require("../../src/db/db");

const database = new Database;

function insertDataToClosedInfraction (uid, modid, mute, ban, warn, kick, till_date, reason, infraction_id) {
    database.query('INSERT INTO closed_infractions (user_id, mod_id, mute, ban, warn, kick, till_date, reason, infraction_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',[uid, modid, mute, ban, warn, kick, till_date, reason, infraction_id]).catch(err => console.log(err));
}

function insertDataToOpenInfraction (uid, modid, mute, ban, till_date, reason, infraction_id, gid) {
    database.query('INSERT INTO open_infractions (user_id, mod_id, mute, ban, till_date, reason, infraction_id, guild_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',[uid, modid, mute, ban, till_date, reason, infraction_id, gid]).catch(err => console.log(err));
}

function inserDataToTemproles (uid, role_id, till_date, infraction_id, gid) {
    database.query('INSERT INTO temproles (user_id, role_id, till_date, infraction_id, guild_id) VALUES (?, ?, ?, ?, ?)', [uid, role_id, till_date, infraction_id, gid]).catch(err => console.log(err));
}

module.exports = {
    insertDataToClosedInfraction,
    insertDataToOpenInfraction,
    inserDataToTemproles
}