const database = require("../../src/db/db");
const { errorhandler } = require('./errorhandler/errorhandler');

function generate() {
    return Math.random().toString(30).substr(2, 50)
}

async function createInfractionId() {
    let infractionid = generate();
    await database.query('SELECT infraction_id FROM open_infractions WHERE infraction_id = ?', [infractionid]).then(res => {
        if(res.length > 0) return createInfractionId();
    }).catch(err => {
        errorhandler({err, fatal: true})
        return false;
    })

    await database.query('SELECT infraction_id FROM closed_infractions WHERE infraction_id = ?', [infractionid]).then(res => {
        if(res.length > 0) return createInfractionId();
    }).catch(err => {
        errorhandler({err, fatal: true})
        return false;
    })
    
    return infractionid;
}

module.exports = {createInfractionId}