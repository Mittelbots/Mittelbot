const { EmbedBuilder } = require('discord.js');
const counterModel = require('~src/db/Models/counter.model');

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
                return reject(404);
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

            return resolve();
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

            return resolve();
        });
    }

    isValidCount(guild_id, user_id, messageContent) {
        return new Promise(async (resolve, reject) => {
            const errorEmbed = new EmbedBuilder().setColor(
                global.t.trans(['general.colors.error'])
            );

            const counter = await this.get(guild_id).catch((err) => {
                errorEmbed.setDescription(err.message);
                return reject(errorEmbed);
            });

            const newCount = counter.count + 1;

            if (counter.last_user === user_id) {
                await this.updateCount(guild_id, null, 0).catch((err) => {
                    errorEmbed.setDescription(err.message);
                    return reject(errorEmbed);
                });

                errorEmbed.setDescription(
                    global.t.trans(['error.fun.counter.sameUserAgain'], guild_id)
                );

                return reject(errorEmbed);
            } else if (parseInt(messageContent) !== newCount) {
                await this.updateCount(guild_id, null, 0).catch((err) => {
                    errorEmbed.setDescription(err.message);
                    return reject(errorEmbed);
                });

                errorEmbed.setDescription(
                    global.t.trans(['error.fun.counter.wrongCount', newCount], guild_id)
                );
                return reject(errorEmbed);
            }

            await this.updateCount(guild_id, user_id, newCount).catch((err) => {});

            return resolve();
        });
    }
};
