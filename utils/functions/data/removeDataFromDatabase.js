const database = require("../../../src/db/db");



async function removeDataFromOpenInfractions(inf_id) {
    await database.query(`DELETE FROM open_infractions WHERE infraction_id = ?`, [inf_id]);
}

module.exports = {
    removeDataFromOpenInfractions
}