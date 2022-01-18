async function removeDataFromOpenInfractions(db, inf_id) {
    await db.query(`DELETE FROM open_infractions WHERE infraction_id = ?`, [inf_id]);
}

module.exports = {
    removeDataFromOpenInfractions
}