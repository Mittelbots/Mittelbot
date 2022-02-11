const { Database } = require("../../../src/db/db");

const database = new Database()

async function removeDataFromOpenInfractions(inf_id) {
    await database.query(`DELETE FROM open_infractions WHERE infraction_id = ?`, [inf_id]);
}

module.exports = {
    removeDataFromOpenInfractions
}