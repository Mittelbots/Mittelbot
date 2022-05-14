const { errorhandler } = require("../errorhandler/errorhandler");
const { getMutedRole } = require('../roles/getMutedRole');
const database = require('../../../src/db/db');
const config = require('../../../src/assets/json/_config/config.json');


async function isMuted({user, guild, bot}) {
    database.query(`SELECT * FROM open_infractions WHERE user_id = ? AND mute = ? AND guild_id = ?`, [user.id, 1, guild.id]).then(async result => {
        let MutedRole = await getMutedRole(bot.guilds.cache.get(guild.id))

        if(MutedRole.error) return MutedRole;

        if (result.length > 0 && await user.roles.cache.has(MutedRole)) {
            for (let i in result) {
                let currentdate = new Date().toLocaleString('de-DE', {timeZone: 'Europe/Berlin'})
                currentdate = currentdate.replace(',', '').replace(':', '').replace(' ', '').replace(':', '').replace('.', '').replace('.', '').replace('.', '');
                result[i].till_date = result[i].till_date.replace(',', '').replace(':', '').replace(' ', '').replace(':', '').replace('.', '').replace('.', '').replace('.', '');

                if ((currentdate - result[i].till_date) <= 0) {
                    return {
                        error: false,
                        isMuted: true
                    }
                }else {
                    return {
                        error: false,
                        isMuted: false
                    }
                }
            }
        }else {
            return {
                error: false,
                isMuted: false
            }
        }
    }).catch(err => {
        errorhandler({err, fatal:true});
        return {
            error: true,
            message: config.errormessages.databasequeryerror
        }
    })
}

async function isOnBanList({user, guild}) {
    return guild.bans.fetch()
        .then(async bans => {
            let list = bans.filter(list_user => list_user.user.id === user.id);
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
        errorhandler({err, fatal: true});
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