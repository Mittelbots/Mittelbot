const { database } = require("../../src/db/db");

function insertDataToClosedInfraction (uid, modid, mute, ban, warn, kick, till_date, reason, infraction_id) {
    database.query('INSERT INTO closed_infractions (user_id, mod_id, mute, ban, warn, kick, till_date, reason, infraction_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)',[uid, modid, mute, ban, warn, kick, till_date, reason, infraction_id], (err) => console.log(err));
}

function insertDataToOpenInfraction (uid, modid, mute, ban, till_date, reason, infraction_id) {
    database.query('INSERT INTO open_infractions (user_id, mod_id, mute, ban, till_date, reason, infraction_id) VALUES (?, ?, ?, ?, ?, ?, ?)',[uid, modid, mute, ban, till_date, reason, infraction_id], (err) => console.log(err));
}

function inserDataToTemproles (uid, role_id, till_date) {
    database.query('INSERT INTO temproles (user_id, role_id, till_date) VALUES (?, ?, ?)', [uid, role_id, till_date])
}

module.exports = {
    insertDataToClosedInfraction,
    insertDataToOpenInfraction,
    inserDataToTemproles
}