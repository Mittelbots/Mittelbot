const Notification = require('../Notifications');
const TwitchNotifier = require('./TwitchLogic');
const { errorhandler } = require('../../../functions/errorhandler/errorhandler');
const { ActionRowBuilder, ButtonBuilder, Message, ButtonStyle } = require('discord.js');
const twitchStreams = require('~src/db/Models/twitchStreams.model');
const Guilds = require('~utils/classes/Guilds');

module.exports = class TwitchNotification extends TwitchNotifier {
    constructor(bot) {
        super();
        this.bot = bot;
        this.notificationApi = new Notification();
        this.guildsApi = new Guilds();
    }

    check() {
        return new Promise(async (resolve, reject) => {
            try {
                const allTwitchStreams = await this.getAllTwitchChannels();

                allTwitchStreams.forEach(async (data) => {
                    let dcChannel;
                    try {
                        dcChannel = await this.bot.channels.fetch(data.dc_channel_id);
                    } catch (err) {
                        const serverAvailable = await this.guildsApi.amIOnThisServer(
                            data.guild_id,
                            this.bot
                        );
                        if (!serverAvailable) return;

                        errorhandler({
                            message: `Error while fetchin channel ${data.dc_channel_id} for twitch stream ${data.twitch_id} in guild ${data.guild_id}`,
                            fatal: false,
                            id: 1694461058,
                        });
                        return;
                    }

                    const streamer = await this.getTwitchFromChannelId(data.twitch_id);
                    const stream = await this.getTwitchStream(data.twitch_id);
                    if (!stream) {
                        const wasLive = data.isStreaming;
                        if (!wasLive) return;

                        const uptime = this.#getUptime(data.streamStartedAt);
                        const embed = await this.#generateEmbed(
                            streamer,
                            stream,
                            {
                                isLive: false,
                                uptime,
                            },
                            data.twitch_id,
                            data.guild_id
                        );

                        const dcMessage = await dcChannel.messages.fetch(data.message);
                        await this.notificationApi.updateNotification({
                            message: dcMessage,
                            embed: embed,
                        });

                        twitchStreams.update(
                            {
                                isStreaming: false,
                                message: null,
                                embedUpdatedAt: null,
                                streamStartedAt: null,
                            },
                            {
                                where: {
                                    twitch_id: data.twitch_id,
                                },
                            }
                        );
                        return;
                    }

                    let isUpdate = false;
                    if (data.message && stream) {
                        if (!this.#embedUpdatedAnHourAgo(data.embedUpdatedAt)) return;
                        isUpdate = true;
                    }

                    // user is new live
                    const uptime = this.#getUptime(stream.startDate);

                    const isEveryone = data.pingrole === data.guild_id;
                    const messageContent = this.#generateMessageContent(data.pingrole, isEveryone);
                    const embed = await this.#generateEmbed(
                        streamer,
                        stream,
                        {
                            uptime,
                            isLive: true,
                        },
                        data.twitch_id,
                        data.guild_id
                    );

                    let message;
                    if (isUpdate) {
                        const dcMessage = await dcChannel.messages.fetch(data.message);
                        message = await this.notificationApi.updateNotification({
                            message: dcMessage,
                            embed: embed,
                        });
                    } else {
                        message = await this.sendTwitchNotification(messageContent, embed, {
                            dc_channel: dcChannel,
                            link: `https://twitch.tv/${stream.userDisplayName}`,
                            twitch_id: data.twitch_id,
                        });
                    }
                    if (!(message instanceof Message)) {
                        return;
                    }

                    await twitchStreams
                        .update(
                            {
                                message: message.id,
                                embedUpdatedAt: new Date(),
                                streamStartedAt: new Date(stream.startDate),
                                isStreaming: true,
                            },
                            {
                                where: {
                                    twitch_id: data.twitch_id,
                                },
                            }
                        )
                        .catch((err) => {
                            return;
                        });
                });

                resolve();
            } catch (err) {
                errorhandler({
                    err,
                });
                reject(err);
            }
        });
    }

    #embedUpdatedAnHourAgo(last_updated) {
        if (!last_updated) return true;
        return new Date().getTime() - last_updated.getTime() >= 1000 * 60 * 60;
    }

    #getUptime(startDate) {
        try {
            const uptime = Math.floor(
                (Date.now() - new Date(startDate).getTime()) / 1000 / 60 / 60
            );
            return uptime;
        } catch (err) {
            errorhandler({
                err,
            });
            return 0;
        }
    }

    #generateMessageContent(pingrole, isEveryone = false) {
        return pingrole ? (isEveryone ? '@everyone' : `<@&${pingrole}>`) : '';
    }

    #generateEmbed(streamer, stream, { isLive, uptime }) {
        return new Promise(async (resolve, reject) => {
            const embed = await this.notificationApi
                .geneateNotificationEmbed({
                    title: isLive
                        ? stream.title
                        : global.t.trans([
                              'info.notifications.twitch.endedStream',
                              streamer.displayName,
                          ]),
                    color: '#6441a5',
                    footer: {
                        text: isLive
                            ? global.t.trans(['info.notifications.twitch.startedHrsAgo', uptime])
                            : global.t.trans(['info.notifications.twitch.wasLiveFor', uptime]),
                    },
                    image: isLive ? stream.getThumbnailUrl(1920, 1080) : streamer.profilePictureUrl,
                    url: isLive
                        ? `https://twitch.tv/${stream.userDisplayName}`
                        : `https://twitch.tv/${streamer.displayName}`,
                    author: {
                        name: isLive
                            ? global.t.trans([
                                  'info.notifications.twitch.justWentLive',
                                  streamer.displayName,
                              ])
                            : global.t.trans([
                                  'info.notifications.twitch.justEnded',
                                  streamer.displayName,
                              ]),
                        iconURL: streamer.profilePictureUrl,
                    },
                    fields: isLive
                        ? [
                              {
                                  name: global.t.trans([
                                      'info.notifications.twitch.fields.game',
                                      streamer.displayName,
                                  ]),
                                  value: stream.gameName,
                                  inline: true,
                              },
                              {
                                  name: global.t.trans([
                                      'info.notifications.twitch.fields.viewers',
                                      streamer.displayName,
                                  ]),
                                  value: stream.viewers.toString() || '0',
                                  inline: true,
                              },
                              {
                                  name: global.t.trans([
                                      'info.notifications.twitch.fields.tags',
                                      streamer.displayName,
                                  ]),
                                  value: stream.tags.join(', ') || stream.tags || 'None',
                                  inline: true,
                              },
                          ]
                        : null,
                    timestamp: true,
                })
                .catch((err) => {
                    errorhandler({
                        err,
                        fatal: true,
                    });
                    reject(err);
                });

            resolve(embed);
        });
    }

    sendTwitchNotification(content, embed, { dc_channel, link, twitch_id }) {
        return new Promise(async (resolve, reject) => {
            this.notificationApi
                .sendNotification({
                    channel: dc_channel,
                    content,
                    embed,
                    components: [
                        new ActionRowBuilder().addComponents(
                            new ButtonBuilder()
                                .setStyle(ButtonStyle.Link)
                                .setLabel('Watch Stream')
                                .setURL(link)
                                .setEmoji('🔴')
                        ),
                    ],
                    channel_id: twitch_id,
                    type: 'twitch',
                })
                .then((message) => {
                    console.info(`🔎 Twitch stream handler checked streamer: ${link}...`);
                    errorhandler({
                        message: `🔎 Twitch stream notification sent! Twitch Streamer: ${link}`,
                        fatal: false,
                        id: 1694433320,
                    });
                    resolve(message);
                })
                .catch((err) => {
                    errorhandler({
                        err,
                    });
                    reject(err);
                });
        });
    }
};
