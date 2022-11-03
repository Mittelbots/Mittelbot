const database = require('../../../src/db/db');
const { errorhandler } = require('../errorhandler/errorhandler');

module.exports.getAllTemproles = async () => {
    if (temproles.length > 0) {
        return temproles[0].list;
    }

    return await database
        .query(`SELECT * FROM temproles`)
        .then((res) => {
            return res;
        })
        .catch((err) => {
            errorhandler({
                err,
                fatal: true,
            });
            return false;
        });
};

module.exports.insertIntoTemproles = async ({ uid, role_id, till_date, infraction_id, gid }) => {
    //?Update cache
    const listLength = temproles[0].list.length;
    temproles[0].list[listLength] = {
        user_id: uid,
        role_id,
        till_date,
        infraction_id,
        guild_id: gid,
    };

    database
        .query(
            'INSERT INTO temproles (user_id, role_id, till_date, infraction_id, guild_id) VALUES (?, ?, ?, ?, ?)',
            [uid, role_id, till_date, infraction_id, gid]
        )
        .catch((err) => {
            return errorhandler({ err, fatal: true });
        });
    return;
};

module.exports.deleteFromTemproles = async ({ inf_id }) => {
    return await database
        .query(`DELETE FROM temproles WHERE infraction_id = ?`, [inf_id])
        .then(() => {
            temproles[0].list.filter((tmp) => tmp.infraction_id !== inf_id);
            return true;
        })
        .catch((err) => {
            return errorhandler({ err, fatal: true });
        });
};
