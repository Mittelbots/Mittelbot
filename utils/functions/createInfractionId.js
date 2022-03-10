const database = require("../../src/db/db");



function generate() {
    return Math.random().toString(30).substr(2, 50)
}

function createInfractionId() {
    let infractionid = generate();
    database.query('SELECT infraction_id FROM open_infractions WHERE infraction_id = ?', [infractionid]).then(res => {
        if(res !== '') createInfractionId();
    }).catch(err => console.log(err))

    database.query('SELECT infraction_id FROM closed_infractions WHERE infraction_id = ?', [infractionid]).then(res => {
        if(res !== '') createInfractionId();
    }).catch(err => console.log(err))
    
    return infractionid;
}

module.exports = {createInfractionId}