const timer = require('~src/db/Models/timer.model');
const momentTZ = require('moment-timezone');

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
                .catch(() => {
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
                .catch(() => {
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
                .catch(() => {
                    return reject(false);
                });
        });
    }

    destroy(guild_id) {
        return new Promise((resolve, reject) => {
            timer
                .destroy({ where: { guild_id } })
                .then(() => {
                    return resolve(true);
                })
                .catch(() => {
                    return reject(false);
                });
        });
    }

    getTimezoneList() {
        return momentTZ.tz.names();
    }

    convertTimeZone(date, timezone) {
        return new Promise((resolve) => {
            return resolve(
                new Date(
                    (typeof date === 'string' ? new Date(date) : date).toLocaleString('en-US', {
                        timeZone: timezone,
                    })
                )
            );
        });
    }
}

module.exports = Timer;
