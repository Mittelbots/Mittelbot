const temproles = require('~src/db/Models/temproles.model');

class Temproles {
    constructor() {}

    getAll() {
        return new Promise(async (resolve, reject) => {
            await temproles
                .findAll()
                .then((data) => {
                    return resolve(data);
                })
                .catch((err) => {
                    return reject(err);
                });
        });
    }

    insert({ uid, role_id, till_date, infraction_id, gid }) {
        return new Promise(async (resolve, reject) => {
            await temproles
                .create({
                    user_id: uid,
                    role_id,
                    till_date,
                    infraction_id,
                    guild_id: gid,
                })
                .then((data) => {
                    return resolve(data);
                })
                .catch((err) => {
                    return reject(err);
                });
        });
    }

    delete(inf_id) {
        return new Promise(async (resolve, reject) => {
            await temproles
                .destroy({
                    where: {
                        infraction_id: inf_id,
                    },
                })
                .then(() => {
                    return resolve(true);
                })
                .catch((err) => {
                    return reject(err);
                });
        });
    }
}

module.exports = Temproles;
