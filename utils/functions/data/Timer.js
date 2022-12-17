const timer = require('../../../src/db/Models/tables/timer.model');
const { errorhandler } = require('../errorhandler/errorhandler');

class Timer {
    defaultTick = 15000; // 15 seconds

    constructor() {}

    getAll() {
        return new Promise((resolve) => {
            timer
                .findAll()
                .then((data) => {
                    return resolve(data);
                })
                .catch((err) => {
                    errorhandler({ err });
                    return resolve([]);
                });
        });
    }

    get(guild_id) {
        return new Promise((resolve) => {
            timer
                .findOne({ where: { guild_id } })
                .then((data) => {
                    return resolve(data);
                })
                .catch((err) => {
                    errorhandler({ err });
                    return resolve([]);
                });
        });
    }

    add({ guild_id, channel_id, started_at, ends_at, endMessage, message_id }) {
        return new Promise((resolve, reject) => {
            timer
                .create({
                    guild_id: guild_id,
                    channel_id: channel_id,
                    started_at: started_at,
                    ends_at: ends_at,
                    endMessage: endMessage,
                    message_id: message_id,
                })
                .then((data) => {
                    return resolve(data);
                })
                .catch((err) => {
                    errorhandler({ err });
                    return reject(false);
                });
        });
    }

    destroy(guild_id) {
        return new Promise((resolve) => {
            timer
                .destroy({ where: { guild_id } })
                .then(() => {
                    return resolve(true);
                })
                .catch((err) => {
                    errorhandler({ err });
                    return reject(false);
                });
        });
    }
}

module.exports = Timer;
