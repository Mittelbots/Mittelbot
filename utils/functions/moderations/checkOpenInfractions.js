const { errorhandler } = require("../errorhandler/errorhandler");

async function isMuted(db, config, member, message) {
    db.query(`SELECT * FROM open_infractions WHERE user_id = ? AND mute = 1`, [member.id]).then(async result => {
        if (result.length > 0) {
            for (let i in result) {
                let currentdate = new Date().toLocaleString('de-DE', {timeZone: 'Europe/Berlin'})
                currentdate = currentdate.replace(',', '').replace(':', '').replace(' ', '').replace(':', '').replace('.', '').replace('.', '').replace('.', '');
                result[i].till_date = result[i].till_date.replace(',', '').replace(':', '').replace(' ', '').replace(':', '').replace('.', '').replace('.', '').replace('.', '');

                if ((currentdate - result[i].till_date) <= 0) {
                    return true;
                }else {
                    return false;
                }
            }
        }
    }).catch(err => {
        return errorhandler(err, config.errormessages.databasequeryerror, message.channel, log, config);
    })
}

async function isBanned(db, member) {
    db.query(`SELECT * FROM open_infractions WHERE user_id = ? AND ban = 1`, [member.id]).then(async result => {
        if (result.length > 0) {
            for (let i in result) {
                let currentdate = new Date().toLocaleString('de-DE', {timeZone: 'Europe/Berlin'})
                currentdate = currentdate.replace(',', '').replace(':', '').replace(' ', '').replace(':', '').replace('.', '').replace('.', '').replace('.', '');
                result[i].till_date = result[i].till_date.replace(',', '').replace(':', '').replace(' ', '').replace(':', '').replace('.', '').replace('.', '').replace('.', '');

                if ((currentdate - result[i].till_date) <= 0) {
                    return true;
                }else {
                    return false;
                }
            }
        }
    }).catch(err => {
        return errorhandler(err, config.errormessages.databasequeryerror, message.channel, log, config);
    })
}

module.exports = {
    isMuted,
    isBanned
}