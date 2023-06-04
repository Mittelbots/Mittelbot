const autodeleteModel = require('~src/db/Models/autodelete.model.js');
const { hasPermission } = require('~utils/functions/hasPermissions.js');

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
                    return reject(
                        global.t.trans(['error.generalWithMessage', err.message], channel.guild.id)
                    );
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
                        return reject(
                            global.t.trans(
                                ['error.generalWithMessage', err.message],
                                channel.guild.id
                            )
                        );
                    });
            } else {
                await autodeleteModel
                    .create({
                        guild_id: channel.guild.id,
                        channel_id: channel.id,
                    })
                    .catch((err) => {
                        return reject(
                            global.t.trans(
                                ['error.generalWithMessage', err.message],
                                channel.guild.id
                            )
                        );
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
                    return reject(
                        global.t.trans(['error.generalWithMessage', err.message], channel.guild.id)
                    );
                });
        });
    }

    check(channel, message) {
        return new Promise(async (resolve, reject) => {
            const settings = await this.get(channel);
            if (!settings) return resolve(false);

            let user;
            try {
                user = await channel.guild.members.fetch(message.author.id);
            } catch (err) {
                return resolve(false);
            }

            const hasModPermissions = await hasPermission({
                guild_id: channel.guild.id,
                adminOnly: false,
                modOnly: false,
                user: user,
                bot: this.bot,
            });
            if (hasModPermissions) return resolve(false);

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
