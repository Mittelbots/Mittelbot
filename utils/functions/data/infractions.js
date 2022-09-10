const database = require("../../../src/db/db");
const { openInfractions, closedInfractions } = require("../cache/cache");
const {
    errorhandler
} = require("../errorhandler/errorhandler");
const { getCurrentFullDate } = require("./dates");

module.exports.getAllOpenInfractions = async () => {
    return await database.query(`SELECT * FROM open_infractions`)
        .then(res => {
            return res;
        }).catch(err => {
            errorhandler({
                err,
                fatal: true
            });
            return false;
        });
}

module.exports.getAllClosedInfractions = async () => {
    return await database.query(`SELECT * FROM closed_infractions`)
    .then(res => {
        return res;
    }).catch(err => {
        errorhandler({
            err,
            fatal: true
        });
        return false;
    });
}

module.exports.insertIntoClosedList = async ({uid, modid, mute = 0, ban = 0, warn = 0, kick = 0, till_date, reason, infraction_id, start_date = getCurrentFullDate()}) => {
    
    //?Update cache
    const listLength = closedInfractions[0].list.length;
    closedInfractions[0].list[listLength] = {
        user_id: uid,
        mod_id: modid,
        mute,
        ban,
        warn,
        kick,
        till_date,
        reason,
        infraction_id,
        start_date: start_date
    }

    database.query('INSERT INTO closed_infractions (user_id, mod_id, mute, ban, warn, kick, till_date, reason, infraction_id, start_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',[uid, modid, mute, ban, warn, kick, till_date, reason, infraction_id, start_date])
    .catch(err => {
        return errorhandler({err, fatal: true});
    });
    return;
}

module.exports.insertIntoOpenList = async ({uid, modid, mute = 0, ban = 0, till_date, reason, infraction_id, gid, roles = null}) => {

    const start_date = getCurrentFullDate();

    //?Update cache
    const listLength = openInfractions[0].list.length;
    openInfractions[0].list[listLength] = {
        user_id: uid,
        mod_id: modid,
        mute,
        ban,
        till_date,
        reason,
        infraction_id,
        guild_id: gid,
        user_roles: roles,
        start_date: start_date
    }

    database.query('INSERT INTO open_infractions (user_id, mod_id, mute, ban, till_date, reason, infraction_id, guild_id, user_roles, start_date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',[uid, modid, mute, ban, till_date, reason, infraction_id, gid, roles, start_date])
    .catch(err => {
        return errorhandler({err, fatal: true});
    });
    return;
}

module.exports.getClosedInfractionsByUserId = async ({user_id, guild_id}) => {
    const cache = closedInfractions[0].list.filter(infraction => infraction.user_id === user_id && infraction.guild_id === guild_id);
    if(cache.length > 0) return cache;
    
    return await database.query(`SELECT * FROM closed_infractions WHERE user_id = ? AND guild = ? ORDER BY ID DESC`, [user_id, guild_id])
    .then(res => {
        return res;
    }).catch(err => {
        errorhandler({err, fatal: true});
        return false;
    });
}

module.exports.getOpenInfractionsByUserId = async ({user_id, guild_id}) => {

    const cache = openInfractions[0].list.filter(infraction => infraction.user_id === user_id && infraction.guild_id === guild_id);
    if(cache.length > 0) return cache;

    return await database.query(`SELECT * FROM open_infractions WHERE user_id = ? AND guild_id = ? ORDER BY ID DESC`, [user_id, guild_id])
    .then(res => {
        return res;
    }).catch(err => {
        errorhandler({err, fatal: true});
        return false;
    });
}


module.exports.getInfractionById = async ({inf_id}) => {
    const open_cache = openInfractions[0].list.filter(infraction => infraction.infraction_id === inf_id);
    if(open_cache.length > 0) return {
        table: "open_infractions",
        infraction: open_cache
    }

    const closed_cache = closedInfractions[0].list.filter(infraction => infraction.infraction_id === inf_id);
    if(closed_cache.length > 0) return {
        table: "closed_infractions",
        infraction: closed_cache
    }

    return await database.query('SELECT * FROM open_infractions WHERE infraction_id = ?; SELECT * FROM closed_infractions WHERE infraction_id = ?', [...inf_id]).then(res => {
        if(res[0].length > 0) {
            return {
                table: "open",
                infraction: res[0]
            }
        }else if(res[1].length > 0) {
            return {
                table: "closed",
                infraction: res[1]
            }
        }
        return false;
    }).catch(err => {
        errorhandler({err, fatal: true})
        return false;
    })
}

module.exports.removeInfractionById = async ({inf_id, type}) => {
    return await database.query(`DELETE FROM ${type}_infractions WHERE infraction_id = ?`, [inf_id])
    .then(() => {
        (type === 'open') 
        ? openInfractions[0].list.filter(infraction => infraction.infraction_id !== inf_id)
        : closedInfractions[0].list.filter(infraction => infraction.infraction_id !== inf_id);

        return true;
    })
    .catch(err => {
        errorhandler({err});
        return false;
    });
}