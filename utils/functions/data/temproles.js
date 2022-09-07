const database = require("../../../src/db/db");
const { temproles } = require("../cache/cache");

module.exports.getAllTemproles = async () => {
    return await database.query(`SELECT * FROM temproles`)
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

module.exports.insertIntoTemproles = async ({uid, role_id, till_date, infraction_id, gid}) => {
    //?Update cache
    const listLength = temproles[0].list.length;
    temproles[0].list[listLength] = {
        user_id: uid,
        role_id,
        till_date,
        infraction_id,
        guild_id: gid
    }

    database.query('INSERT INTO temproles (user_id, role_id, till_date, infraction_id, guild_id) VALUES (?, ?, ?, ?, ?)', [uid, role_id, till_date, infraction_id, gid])
    .catch(err => {
        return errorhandler({err, fatal: true});
    });
    return;
}
