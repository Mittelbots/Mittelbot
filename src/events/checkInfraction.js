const config = require('nodemon/lib/config');
const {
    database
} = require('../db/db');

function checkInfractions() {
    setInterval(() => {
        database.query(`SELECT * FROM open_infractions`, async (err, results) => {
            if(err) {
                console.log(`${config.errormessages.databasequeryerror}`, err)
            }
            if(await results == '') return;

            let done = 0;

            for(let i in await results) {
                //Member can be unmuted
                if ((new Date(results[i].till_date) / 1000) <= Math.round((new Date() / 1000))) {
                    try {
                        done++;
                        database.query('DELETE FROM open_infractions WHERE id = ?', [results[i].id], (err) => {
                        if(err) console.log(err);
                    })
                    }catch(err) {
                        console.log(err);
                    }
                }
            }
            console.log(`Check Infraction done. ${done} infractions removed!`, new Date().toLocaleString('de-DE', {timeZone: 'Europe/Berlin'}))
        })
    }, 60000);
}

module.exports = {checkInfractions}