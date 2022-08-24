const { errorhandler } = require("../errorhandler/errorhandler");
const { getMutedRole } = require('../roles/getMutedRole');
const database = require('../../../src/db/db');
const config = require('../../../src/assets/json/_config/config.json');


async function isMuted({user, guild, bot}) {
    return await database.query(`SELECT * FROM open_infractions WHERE user_id = ? AND mute = ? AND guild_id = ?`, [user.id, 1, guild.id]).then(async result => {
        let MutedRole = await getMutedRole(bot.guilds.cache.get(guild.id))

        if(MutedRole.error) return MutedRole;

        const member = guild.members.cache.get(user.id);

        if(!member) return {
            error: true,
            message: "No member found!"
        }

        if (result.length > 0 && await member.roles.cache.has(MutedRole)) {
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
        errorhandler({err});
        return {
            error: true,
            message: config.errormessages.databasequeryerror
        }
    })
}

async function isOnBanList({user, guild}) {

    const fetchedLogs = await guild.fetchAuditLogs({
        type: 22
	});
    var banLog = await fetchedLogs.entries.filter(entry => entry.target.id === user.id);

    if(banLog) {
        banLog = banLog.first();
        var { executor, target, reason } = banLog;
    }

    return await guild.bans.fetch()
        .then(async bans => {
            let list = bans.filter(ban => ban.user.id === user.id);
            
            if(list.size < 0) return [false];
            else return [true, reason, executor];

        }).catch(err => {
            errorhandler({fatal: false, err});
            return [false];
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
        errorhandler({err});
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