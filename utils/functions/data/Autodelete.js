const autodeleteModel = require('../../../src/db/Models/tables/autodelete.model.js');
const { errorhandler } = require('../errorhandler/errorhandler.js');
const { isMod } = require('../isMod.js');

module.exports = class Autodelete {
    #defaultTypes = ['isOnlyMedia', 'isOnlyText', 'isOnlyEmotes', 'isOnlyStickers'];

    constructor(bot) {
        this.bot = bot;
    }

    checkType(type) {
        return this.#defaultTypes.includes(type);
    }

    get(channel) {
        return new Promise(async (resolve, reject) => {
            return await autodeleteModel
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
                    return reject(`An error occured while fetching the settings.`);
                });
        });
    }

    set(channel, type, value) {
        return new Promise(async (resolve, reject) => {
            if (!this.checkType(type)) {
                return reject('Please provide a valid type');
            }

            if (await this.get(channel)) {
                await autodeleteModel
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
                        return reject(`An error occured while saving the settings.`);
                    });
            } else {
                await autodeleteModel
                    .create({
                        guild_id: channel.guild.id,
                        channel_id: channel.id,
                    })
                    .catch((err) => {
                        errorhandler({
                            err,
                        });
                        return reject(`An error occured while saving the settings.`);
                    });
            }

            await autodeleteModel
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
            const user = await this.bot.users.fetch(message.user.id);
            if (
                user.permission.has('administrator') ||
                (await isMod({ member: user, guild: channel.guild }))
            ) {
                return resolve(false);
            }

            const settings = await this.get(channel);
            if (!settings) return resolve(false);

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
