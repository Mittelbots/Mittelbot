const { errorhandler } = require("../errorhandler/errorhandler");
const { getMutedRole } = require('../roles/getMutedRole');
const database = require('../../../src/db/db');
const { insertDataToOpenInfraction } = require("../insertDataToDatabase");



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
        return errorhandler(err, config.errormessages.databasequeryerror, message.channel, log, config, true);
    })
}

async function isOnBanList(member, guild) {
    return guild.bans.fetch()
        .then(async bans => {
            let list = bans.filter(user => user.user.id === member);
            let reason = list.map(list => list.reason)[0];

            if(JSON.stringify(list).length < 10) return [false];
            else return [true, reason];

        }).catch(err => {
            return false;
        })
}

async function isBanned(member, guild) {
    let banList = await guild.bans.fetch();

    return await database.query(`SELECT * FROM open_infractions WHERE user_id = ? AND ban = ? AND guild_id = ?`, [member.id, 1, guild.id]).then(async result => {
        if (result.length > 0) {
            const isUserOnBanList = banList.get(member.id);

            for (let i in result) {
                let currentdate = new Date().toLocaleString('de-DE', {timeZone: 'Europe/Berlin'})
                currentdate = currentdate.replace(',', '').replace(':', '').replace(' ', '').replace(':', '').replace('.', '').replace('.', '').replace('.', '');
                result[i].till_date = result[i].till_date.replace(',', '').replace(':', '').replace(' ', '').replace(':', '').replace('.', '').replace('.', '').replace('.', '');

                if ((currentdate - result[i].till_date) <= 0 || isUserOnBanList !== undefined) {
                    return {
                        error: false,
                        isBanned: true
                    }
                }else {
                    return {
                        error: false,
                        isBanned: false
                    }
                }
            }
        }else {
            return {
                error: false,
                isBanned: false
            }
        }
    }).catch(err => {
        errorhandler(err, null, null, log, config, true);
        return {
            error: true,
            message: config.errormessages.databasequeryerror
        }
    });


}

module.exports = {
    isMuted,
    isBanned,
    isOnBanList
}