const { errorhandler } = require("../errorhandler/errorhandler");
const { getMutedRole } = require('../roles/getMutedRole');
const { Database } = require('../../../src/db/db');

const database = new Database()

async function isMuted(config, member, message, log, bot) {
    database.query(`SELECT * FROM open_infractions WHERE user_id = ? AND mute = ? AND guild_id = ?`, [member.id, 1, message.guild.id]).then(async result => {
        let MutedRole = await getMutedRole(message, bot.guilds.cache.get(message.guild.id))
        if (result.length > 0 && await member.roles.cache.has(MutedRole)) {
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
        }else {
            return false;
        }
    }).catch(err => {
        return errorhandler(err, config.errormessages.databasequeryerror, message.channel, log, config);
    })
}

async function isBanned(member, message) {
    database.query(`SELECT * FROM open_infractions WHERE user_id = ? AND ban = ? AND guild_id = ?`, [member.id, 1, message.guild.id]).then(async result => {
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