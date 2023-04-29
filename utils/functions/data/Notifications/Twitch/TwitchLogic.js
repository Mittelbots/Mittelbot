const { PermissionFlagsBits } = require('discord.js');
const { ApiClient } = require('@twurple/api');
const { AppTokenAuthProvider } = require('@twurple/auth');

const { errorhandler } = require('../../../errorhandler/errorhandler');
const twitchStreams = require('../../../../../src/db/Models/tables/twitchStreams.model');

module.exports = class TwitchNotifier {
    #twitchApiClient;

    constructor() {
        const clientId = process.env.TT_CLIENT_ID;
        const clientSecret = process.env.TT_SECRET;

        const authProvider = new AppTokenAuthProvider(clientId, clientSecret);

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
                return reject(`❌ I couldn't find the channel you have entered.`);
            }

            await this.#fetchMembers({ guild });
            const hasChannelPermission = await this.#checkChannelPerms({ twdcchannel, guild });
            if (!hasChannelPermission) {
                reject(
                    `❌ I don't have one of these permissions \`"VIEW_CHANNEL", "SEND_MESSAGES", "EMBED_LINKS", "ATTACH_FILES", "MENTION_EVERYONE"\`. Change them and try again.`
                );
                return;
            }

            const isAvailable = await this.#checkAvailability({
                twitchchannel: twitchId,
                guild,
            }).catch(() => {
                reject(`❌ You can only add 3 twitch channels. Remove one and try again.`);
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
                    resolve(`✅ Successfully updated the twitch channel \`${twitchchannel}\`.`);
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
                        `✅ Successfully added the twitch channel \`${twitchchannel}\` to the list.`
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
                    err,
                    fatal: false,
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
                        `❌ Something went wrong while selecting all twitch channels. Please contact the Bot support.`
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
                .catch((err) => {
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
                return reject(`❌ I couldn't find the channel you have entered.`);
            }

            await twitchStreams
                .destroy({
                    where: {
                        guild_id,
                        twitch_id: twitchChannel.id,
                    },
                })
                .then(() => {
                    resolve('✅ Successfully removed the twitch channel to the notification list.');
                })
                .catch((err) => {
                    reject(
                        '❌ Something went wrong while removing the channel from the database. Please contact the Bot support.'
                    );
                });
        });
    }
};
