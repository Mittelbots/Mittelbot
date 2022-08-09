const database = require("../../../src/db/db");
const { errorhandler } = require("../errorhandler/errorhandler");

async function removeDataFromOpenInfractions(inf_id) {
    await database.query(`DELETE FROM open_infractions WHERE infraction_id = ?`, [inf_id])
        .catch(err => {
            errorhandler({err});
        })
}

module.exports = {
    removeDataFromOpenInfractions
}