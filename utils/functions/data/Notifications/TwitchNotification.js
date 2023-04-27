const twitchStreams = require('../../../../src/db/Models/tables/twitchStreams.model');
const Notification = require('./Notifications');
const TwitchNotifier = require('./TwitchLogic');
const { errorhandler } = require('../../errorhandler/errorhandler');

let savedStreams = [];

module.exports = class TwitchNotification extends TwitchNotifier {
    guild = null;
    dc_channel = null;
    guildPingrole = null;
    uptime = null;
    isLive = false;
    stream = null;

    streamerInfos = {
        channel_name: '',
        channel_id: '',
    };

    dbdata = null;

    constructor(bot) {
        super();
        this.bot = bot;
        this.notificationApi = new Notification();
    }

    check() {
        return new Promise(async (resolve, reject) => {
            this.twitchAccounts = await this.getAllTwitchChannels().catch((err) => {
                reject(err);
            });

            if (this.twitchAccounts.length < 1) {
                console.info(
                    `🔎 Twitch upload handler Interval has ended because there are no uploads to check`
                );
                return reject();
            }

            this.twitchAccounts.forEach(async (account) => {
                this.streamerInfos.channel_name = account.channel_name;
                this.streamerInfos.channel_id = account.channel_id;

                await this.getServerInfos(
                    account.guild_id,
                    account.info_channel_id,
                    account.pingrole
                );

                const streamer = await this.getTwitchFromChannelName(
                    this.streamerInfos.channel_name
                );

                this.stream = await this.getTwitchStream(account.channel_id);
                this.isLive = await this.checkStreamIsLive();
                const wasLive = savedStreams.filter(
                    (stream) => stream.channel_id === this.streamerInfos.channel_id
                );

                await this.fetchUpTime();

                this.dbdata = await this.getDB(this.streamerInfos.channel_id).catch((err) => {
                    reject(err);
                });
                if (!this.isLive && wasLive.length > 0) {
                    const embed = this.generateTwitchNotificationEmbed(streamer, false);
                    this.updateTwitchMessage(embed);
                    savedStreams.filter(
                        (stream) => stream.channel_id === this.streamerInfos.channel_id
                    );
                    return;
                } else if (wasLive.length > 0) {
                    const lastUpdate = wasLive[0].last_update;
                    const islessThen1Hour = Date.now() - lastUpdate < 1000 * 60 * 60;
                    if (!islessThen1Hour) return;

                    const embed = await this.generateTwitchNotificationEmbed(streamer, true);
                    this.updateTwitchMessage(embed);
                    return;
                } else {
                    savedStreams.push({
                        channel_id: this.streamerInfos.channel_id,
                        stream: this.stream,
                        last_update: Date.now(),
                    });
                }

                await this.updateDB(this.streamerInfos.channel_id).catch((err) => {
                    reject(err);
                });

                console.info(
                    `🔎 Twitch stream handler checking streamer: ${this.streamerInfos.channel_name}...`
                );

                let isEveryone = false;
                if (this.pingrole) {
                    isEveryone = this.pingrole.name === '@everyone';
                }

                const content = await this.generateMessageContent(isEveryone);
                const embed = await this.generateTwitchNotificationEmbed(streamer, true);

                await this.sendTwitchNotification(content, embed).catch((err) => {
                    reject(err);
                });
            });

            resolve();
        });
    }

    checkStreamIsLive() {
        return new Promise(async (resolve) => {
            return this.stream ? resolve(true) : resolve(false);
        });
    }

    getServerInfos(guild_id, info_channel_id, pingrole) {
        return new Promise(async (resolve) => {
            this.guild = this.bot.guilds.cache.get(guild_id);
            this.dc_channel = this.guild.channels.cache.get(info_channel_id);
            this.guildPingrole = this.guild.roles.cache.get(pingrole);

            resolve();
        });
    }

    fetchUpTime() {
        return new Promise(async (resolve, reject) => {
            try {
                this.uptime = Math.floor(
                    (Date.now() - new Date(this.stream.started_at).getTime()) / 1000 / 60 / 60
                );
                resolve();
            } catch (e) {
                reject(e);
            }
        });
    }

    getDB(channel_id) {
        return new Promise(async (resolve, reject) => {
            await twitchStreams
                .findOne({
                    where: {
                        guild_id: this.guild.id,
                        channel_id: channel_id,
                    },
                })
                .then((stream) => {
                    resolve(stream);
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    updateDB(channel_id) {
        return new Promise(async (resolve, reject) => {
            await twitchStreams
                .update(
                    {
                        isStreaming: this.isLive,
                        message: null
                    },
                    {
                        where: {
                            guild_id: this.guild.id,
                            channel_id: channel_id,
                        },
                    }
                )
                .then(() => {
                    console.info(
                        `🔎 Twitch stream handler updated streamer: ${this.streamerInfos.channel_name}...`
                    );
                    resolve();
                })
                .catch((err) => {
                    errorhandler({
                        err,
                    });
                    reject(err);
                });
        });
    }

    generateMessageContent(isEveryone) {
        return new Promise(async (resolve) => {
            const content = this.pingrole ? (isEveryone ? '@everyone' : `${this.pingrole}`) : '';
            return resolve(content);
        });
    }

    generateTwitchNotificationEmbed(streamer, isLive) {
        return new Promise(async (resolve, reject) => {
            const embed = await this.notificationApi
                .geneateNotificationEmbed({
                    title: isLive ? `${this.stream.title}` : null,
                    color: '#6441a5',
                    footer: {
                        text: isLive
                            ? `Stream started ${this.uptime} hours ago`
                            : `Stream ended after ${this.uptime} Uptime`,
                    },
                    image: isLive ? this.stream.getThumbnailUrl(1920, 1080) : null,
                    url: `https://twitch.tv/${streamer.userDisplayName}`,
                    author: {
                        name: isLive
                            ? `${this.stream.userDisplayName} just went live on Twitch!`
                            : `${streamer.userDisplayName} just ended their stream!`,
                        iconURL: streamer.profilePictureUrl,
                    },
                    fields: isLive
                        ? [
                              {
                                  name: 'Game',
                                  value: this.stream.gameName,
                              },
                              {
                                  name: 'Viewers',
                                  value: this.stream.viewers.toString(),
                              },
                              {
                                  name: 'Tags',
                                  value: this.stream.tags.join(', '),
                              },
                          ]
                        : null,
                })
                .catch((err) => {
                    errorhandler({
                        err,
                        fatal: true,
                    });
                    reject(err);
                });

            return resolve(embed);
        });
    }

    sendTwitchNotification(content, embed) {
        return new Promise(async (resolve, reject) => {
            this.notificationApi
                .sendNotification({
                    channel: this.dc_channel,
                    content,
                    embed,
                })
                .then(() => {
                    console.info(
                        `🔎 Twitch stream handler checked streamer: ${this.streamerInfos.channel_name}...`
                    );
                    errorhandler({
                        err: `🔎 Twitch stream notification sent! Twitch Streamer: ${this.streamerInfos.channel_name}`,
                        fatal: false,
                    });
                    resolve();
                })
                .catch((err) => {
                    errorhandler({
                        err,
                        fatal: true,
                    });
                    reject(err);
                });
        });
    }

    updateTwitchMessage(embed) {
        return new Promise(async (resolve, reject) => {
            const channel = this.bot.channels.cache.get(this.dc_channel);
            const message = await channel.messages.fetch(this.dbdata.message);

            message
                .edit({
                    embeds: [embed],
                })
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    reject(err);
                });
        });
    }

    saveToSavedStreams(channel_id) {
        savedStreams.push({
            channel_id: channel_id,
            isStreaming: this.isLive,
            last_update: Date.now(),
        });
    }
};
