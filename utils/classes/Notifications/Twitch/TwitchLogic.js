const { PermissionFlagsBits } = require('discord.js');
const { ApiClient } = require('@twurple/api');
const { AppTokenAuthProvider } = require('@twurple/auth');

const { errorhandler } = require('../../../functions/errorhandler/errorhandler');
const twitchStreams = require('~src/db/Models/twitchStreams.model');

module.exports = class TwitchNotifier {
    #twitchApiClient;

    constructor() {
        const clientId = process.env.TT_CLIENT_ID;
        const clientSecret = process.env.TT_SECRET;

        const authProvider = new AppTokenAuthProvider(clientId, clientSecret);

        if (!clientId || !clientSecret) {
            console.error('===============================');
            console.error('TwitchNotifier: No Client ID or Client Secret found!');
            console.error('TwitchNotifier: Please check your .env file!');
            console.error('TwitchNotifier: Disabling TwitchNotifier...');
            console.error('===============================');
            this.disabled = true;
            return;
        }

        this.#twitchApiClient = new ApiClient({
            authProvider,
        });
    }

    getApiClient() {
        return this.#twitchApiClient;
    }

    change({ twitchchannel, twdcchannel, twpingrole, guild }) {
        return new Promise(async (resolve, reject) => {
            const twitch_user = await this.getTwitchFromChannelName(twitchchannel);

            const twitchId = twitch_user.id;
            const twitchName = twitch_user.name;

            if (!twitch_user) {
                return reject(global.t.trans(['error.notifications.twitch.notFound'], guild.id));
            }

            await this.#fetchMembers({ guild });
            const hasChannelPermission = await this.#checkChannelPerms({ twdcchannel, guild });
            if (!hasChannelPermission) {
                reject(
                    global.t.trans(
                        [
                            'error.permissions.bot.roleAdd',
                            '"VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "MENTION_EVERYONE"',
                        ],
                        guild.id
                    )
                );
                return;
            }

            const isAvailable = await this.#checkAvailability({
                twitchchannel: twitchId,
                guild,
            }).catch(() => {
                reject(global.t.trans(['error.notifications.twitch.maxReached', 3], guild.id));
                return '3';
            });

            if (isAvailable === '3') return;

            if (!isAvailable) {
                await this.#updateTwitchChannel({
                    twitchchannelId: twitchId,
                    twdcchannel,
                    twpingrole,
                    guild,
                }).then(() => {
                    resolve(
                        global.t.trans(
                            ['success.notifications.twitch.updated', twitchchannel],
                            guild.id
                        )
                    );
                });
            } else {
                await this.#createTwitchChannel({
                    twitchchannelId: twitchId,
                    twitchchannelName: twitchName,
                    twdcchannel,
                    twpingrole,
                    guild,
                }).then(() => {
                    resolve(
                        global.t.trans(
                            ['success.notifications.twitch.added', twitchchannel],
                            guild.id
                        )
                    );
                });
            }
        });
    }

    getTwitchFromChannelName(channelname) {
        return new Promise(async (resolve) => {
            try {
                const twitch_user = await this.getApiClient().users.getUserByName(channelname);
                resolve(twitch_user);
            } catch (err) {
                errorhandler({
                    err,
                });
                resolve(false);
            }
        });
    }

    getTwitchFromChannelId(channelid) {
        return new Promise(async (resolve) => {
            try {
                const twitch_user = await this.getApiClient().users.getUserById(channelid);
                resolve(twitch_user);
            } catch (err) {
                errorhandler({
                    err,
                });
                resolve(false);
            }
        });
    }

    getTwitchStream(twitch_id) {
        return new Promise(async (resolve) => {
            try {
                const streamer = await this.getApiClient().streams.getStreamByUserId(twitch_id);
                resolve(streamer);
            } catch (err) {
                if (err.message.includes('self-signed certificate')) return false;

                errorhandler({
                    message: `Error while getting the Twitch Stream`,
                    fatal: false,
                    id: 1694433290,
                });
                resolve(false);
            }
        });
    }

    #fetchMembers({ guild }) {
        return new Promise(async (resolve) => {
            if (!guild.members.me) {
                await guild.members.fetch(process.env.DISCORD_APPLICATION_ID);
            }

            resolve(true);
        });
    }

    #checkChannelPerms({ twdcchannel, guild }) {
        return new Promise(async (resolve) => {
            try {
                const hasChannelPerms = twdcchannel
                    .permissionsFor(guild.members.me)
                    .has([
                        PermissionFlagsBits.ViewChannel,
                        PermissionFlagsBits.SendMessages,
                        PermissionFlagsBits.EmbedLinks,
                        PermissionFlagsBits.AttachFiles,
                        PermissionFlagsBits.MentionEveryone,
                    ]);
                return resolve(hasChannelPerms);
            } catch (err) {
                errorhandler({ err });
                resolve(false);
            }
        });
    }

    getAllChannelsFromGuild({ guild }) {
        return new Promise(async (resolve, reject) => {
            const allChannelsFromGuild = await twitchStreams
                .findAll({
                    where: {
                        guild_id: guild.id,
                    },
                })
                .then((res) => {
                    return res;
                })
                .catch((err) => {
                    reject(
                        global.t.trans(['error.notifications.twitch.selectEveryChannel'], guild.id)
                    );
                    return false;
                });

            if (!allChannelsFromGuild) return resolve(false);

            resolve(allChannelsFromGuild);
        });
    }

    #checkAvailability({ twitchchannel, guild }) {
        return new Promise(async (resolve, reject) => {
            const allChannelsFromGuild = await this.getAllChannelsFromGuild({ guild });
            if (allChannelsFromGuild.length > 0) {
                const twChannelExists = allChannelsFromGuild.filter(
                    (channel) => channel.twitch_id == twitchchannel
                );

                if (allChannelsFromGuild.length >= 3 && !twChannelExists) {
                    return reject('3');
                }
                if (twChannelExists.length > 0) {
                    return resolve(false);
                }
            }
            resolve(true);
        });
    }

    #updateTwitchChannel({ twitchchannelId, twdcchannel, twpingrole, guild }) {
        return new Promise(async (resolve, reject) => {
            twitchStreams
                .update(
                    {
                        dc_channel_id: twdcchannel.id,
                        pingrole: twpingrole ? twpingrole.id : null,
                    },
                    {
                        where: {
                            guild_id: guild.id,
                            twitch_id: twitchchannelId,
                        },
                    }
                )
                .then(() => {
                    resolve(true);
                })
                .catch((err) => {
                    reject(false);
                });
        });
    }

    #createTwitchChannel({ twitchchannelId, twdcchannel, twpingrole, guild }) {
        return new Promise(async (resolve, reject) => {
            await twitchStreams
                .create({
                    guild_id: guild.id,
                    twitch_id: twitchchannelId,
                    dc_channel_id: twdcchannel.id,
                    pingrole: twpingrole ? twpingrole.id : null,
                })
                .then(() => {
                    resolve(true);
                })
                .catch(() => {
                    reject(false);
                });
        });
    }

    getAllTwitchChannels() {
        return new Promise(async (resolve, reject) => {
            await twitchStreams
                .findAll()
                .then((res) => {
                    resolve(res);
                })
                .catch((err) => {
                    errorhandler({
                        err,
                    });
                    reject(err);
                });
        });
    }

    delete(guild_id, channel) {
        return new Promise(async (resolve, reject) => {
            const twitchChannel = await this.getTwitchFromChannelName(channel);
            if (!twitchChannel) {
                return reject(global.t.trans(['error.notifications.twitch.notFound'], guild_id));
            }

            await twitchStreams
                .destroy({
                    where: {
                        guild_id,
                        twitch_id: twitchChannel.id,
                    },
                })
                .then(() => {
                    resolve(global.t.trans(['success.notifications.twitch.removed'], guild_id));
                })
                .catch(() => {
                    reject(global.t.trans(['error.notifications.twitch.removeChannel'], guild_id));
                });
        });
    }
};
