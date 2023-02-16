const excludeChannelModel = require('../../../src/db/Models/tables/excludeChannel.model.js');
const { errorhandler } = require('../errorhandler/errorhandler.js');

module.exports = class ExcludeChannel {
    #defaultTypes = ['isOnlyMedia', 'isOnlyText', 'isOnlyEmotes', 'isOnlyStickers'];

    constructor(bot) {
        this.bot = bot;
    }

    checkType(type) {
        return this.#defaultTypes.includes(type);
    }

    getOne(channel, type) {
        return new Promise(async (resolve, reject) => {
            if (!this.checkType(type)) {
                return reject('Please provide a valid type');
            }

            return await excludeChannelModel
                .findOne({
                    where: {
                        guild_id: channel.guild.id,
                        channel_id: channel.id,
                        [type]: true,
                    },
                })
                .then((result) => {
                    return resolve(result);
                })
                .catch((err) => {
                    errorhandler({
                        err,
                    });
                    return reject(`An error occured while getting the channel from the database`);
                });
        });
    }

    get(channel) {
        return new Promise(async (resolve, reject) => {
            return await excludeChannelModel
                .findOne({
                    where: {
                        guild_id: channel.guild.id,
                        channel_id: channel.id,
                    },
                })
                .then((result) => {
                    return resolve(result);
                })
                .catch((err) => {
                    errorhandler({
                        err,
                    });
                    return reject(`An error occured while getting the channel from the database`);
                });
        });
    }

    set(channel, type, value) {
        return new Promise(async (resolve, reject) => {
            if (!this.checkType(type)) {
                return reject('Please provide a valid type');
            }

            if (await this.get(channel)) {
                await excludeChannelModel
                    .update(
                        {
                            isOnlyMedia: false,
                            isOnlyText: false,
                            isOnlyEmotes: false,
                            isOnlyStickers: false,
                        },
                        {
                            where: {
                                guild_id: channel.guild.id,
                                channel_id: channel.id,
                            },
                        }
                    )
                    .catch((err) => {
                        errorhandler({
                            err,
                        });
                        return reject(`An error occured while setting the channel in the database`);
                    });
            } else {
                await excludeChannelModel
                    .create({
                        guild_id: channel.guild.id,
                        channel_id: channel.id,
                    })
                    .catch((err) => {
                        errorhandler({
                            err,
                        });
                        return reject(`An error occured while setting the channel in the database`);
                    });
            }

            await excludeChannelModel
                .update(
                    {
                        [type]: value,
                    },
                    {
                        where: {
                            guild_id: channel.guild.id,
                            channel_id: channel.id,
                        },
                    }
                )
                .then(() => {
                    return resolve();
                })
                .catch((err) => {
                    errorhandler({
                        err,
                    });
                    return reject(`An error occured while setting the channel in the database`);
                });
        });
    }

    check(channel, message) {
        return new Promise(async (resolve, reject) => {
            const settings = await this.get(channel);
            switch (true) {
                case settings.isOnlyMedia:
                    if (!message.attachments.size) {
                        return resolve(true);
                    }
                    break;
                case settings.isOnlyText:
                    if (!message.content || message.content == '') {
                        return resolve(true);
                    }
                    break;
                case settings.isOnlyEmotes:
                    const emotes = message.content.match(/<a?:\w+:\d+>/g);
                    const isTextInMessage = message.content.replace(/<a?:\w+:\d+>/g, '').trim();
                    if (!emotes || !emotes.length || isTextInMessage) {
                        return resolve(true);
                    }
                    break;
                case settings.isOnlyStickers:
                    if (!message.stickers.size) {
                        return resolve(true);
                    }
                    break;
                default:
                    return resolve(false);
            }
        });
    }
};
