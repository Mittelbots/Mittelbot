const counterModel = require('../../../../src/db/Models/tables/counter.model');

module.exports = class Counter {
    constructor() {}

    get(guild_id) {
        return new Promise(async (resolve, reject) => {
            const counter = counterModel
                .findOne({
                    where: {
                        guild_id: guild_id,
                    },
                })
                .catch((err) => {});

            if (!counter) {
                return reject('No counter found');
            }

            return resolve(counter);
        });
    }

    create(guild_id, channel_id) {
        return new Promise(async (resolve, reject) => {
            await counterModel
                .create({
                    guild_id: guild_id,
                    channel_id: channel_id,
                })
                .catch((err) => {
                    return reject(err.message);
                });

            return resolve();
        });
    }

    delete(guild_id) {
        return new Promise(async (resolve, reject) => {
            await counterModel
                .destroy({
                    where: {
                        guild_id: guild_id,
                    },
                })
                .catch((err) => {
                    return reject(err.message);
                });

            return resolve(counter);
        });
    }

    updateCount(guild_id, user_id, count) {
        return new Promise(async (resolve, reject) => {
            await counterModel
                .update(
                    {
                        count: count,
                        last_user: user_id,
                    },
                    {
                        where: {
                            guild_id: guild_id,
                        },
                    }
                )
                .catch((err) => {
                    return reject(err.message);
                });

            return resolve(counter);
        });
    }

    isValidCount(guild_id, user_id, messageContent) {
        return new Promise(async (resolve, reject) => {
            const counter = await this.get(guild_id).catch((err) => {
                return reject(err.message);
            });

            if (counter.last_user === user_id) {
                await this.updateCount(guild_id, null, 0).catch((err) => {
                    return reject(err.message);
                });

                return reject('User already counted');
            } else if (messageContent !== counter.count + 1) {
                await this.updateCount(guild_id, null, 0).catch((err) => {
                    return reject(err.message);
                });

                return reject('Invalid count');
            }

            return resolve();
        });
    }
};
