const request = new (require('rss-parser'))();
const { Message } = require('discord.js');
const guildUploads = require('~src/db/Models/guildUploads.model');
const { errorhandler } = require('../../../functions/errorhandler/errorhandler');
const Notification = require('../Notifications');
const YouTubeLogic = require('./YouTubeLogic');
const { delay } = require('~utils/functions/delay');

module.exports = class YouTubeNotification extends YouTubeLogic {
    constructor() {
        super();
        this.intervalTries = 0;
    }

    init(bot) {
        this.bot = bot;
        this.notificationApi = new Notification();
        this.initInterval();
    }

    async checkUploads() {
        try {
            const uploads = await guildUploads.findAll();

            if (uploads.length === 0) {
                console.info(
                    '🔎 Youtube upload handler Interval has ended because there are no uploads to check'
                );
                return false;
            }

            for (const upload of uploads) {
                if (!upload.channel_id) continue;

                const feed = await this.getFeed(upload.channel_id);
                if (!feed) continue;

                const { channel, guild } = await this.getServerInfos(
                    upload.guild_id,
                    upload.info_channel_id
                );
                if (!channel || !guild) continue;

                const latestVideo = feed.items[0];

                let uploadedVideos = upload.uploads || [];

                const videoAlreadyExists = uploadedVideos.includes(latestVideo.link);
                if (videoAlreadyExists && upload.messageId) {
                    if (!this.isLongerThanXh(upload.updatedAt)) continue;
                    await this.updateEmbed(
                        latestVideo,
                        upload.messageId,
                        upload.guild_id,
                        upload.info_channel_id,
                        upload.channel_id
                    );
                    continue;
                }

                const videoDetails = await this.getVideoInfos(latestVideo.link);
                if (!videoDetails) continue;

                if (uploadedVideos.length >= 10) {
                    uploadedVideos = [latestVideo.link];
                } else {
                    uploadedVideos.push(latestVideo.link);
                }

                const pingrole = guild.roles.cache.get(upload.pingrole);
                let isEveryone = false;
                if (pingrole) {
                    isEveryone = pingrole.name === '@everyone';
                }
                const ping = pingrole ? (isEveryone ? '@everyone ' : `${pingrole}`) : '';

                const premiereStartsIn = await this.handlePremiere(
                    videoDetails?.liveBroadcastDetails
                );

                const embedContent = this.generateMessageContent(
                    videoDetails?.liveBroadcastDetails,
                    premiereStartsIn,
                    ping
                );
                const embed = await this.generateEmbed(videoDetails, upload.channel_id, guild.id);

                try {
                    const message = await this.notificationApi.sendNotification({
                        channel,
                        content: embedContent,
                        embed: embed,
                        channel_id: upload.channel_id,
                        type: 'yt',
                    });

                    if (!message || !message.id) continue;

                    if (message instanceof Message) {
                        await this.updateUploads({
                            guildId: guild.id,
                            channelId: upload.channel_id,
                            uploads: uploadedVideos,
                            messageId: message.id,
                            views: videoDetails.viewCount,
                            subs: videoDetails.author.subscriber_count,
                        });
                    }

                    console.info(
                        `📥 New upload sent! GUILD: ${guild.id} CHANNEL ID: ${upload.info_channel_id} YOUTUBE LINK: ${latestVideo.link}`
                    );
                } catch (err) {
                    console.error(
                        `I have failed to send a youtube upload message to ${channel.name} (${channel.id}) in ${guild.name} (${guild.id}). LINK: ${latestVideo.link}`,
                        err
                    );
                }

                this.intervalTries++;

                if (this.intervalTries >= 10) {
                    await delay(1000);
                    this.intervalTries = 0;
                }
            }

            console.info('🔎 Youtube upload handler Interval has finished');
            return true;
        } catch (err) {
            errorhandler({
                err,
            });
            return false;
        }
    }

    initInterval() {
        setInterval(() => {
            this.checkUploads();
        }, this.interval);
    }

    getFeed(channelId) {
        return new Promise(async (resolve, reject) => {
            request
                .parseURL(this.baseURL + channelId)

                .then((feed) => {
                    resolve(feed);
                })
                .catch((err) => {
                    if (
                        this.ignoreErrorNames.includes(err.errno) ||
                        this.ignoreErrorCodes.includes(err.code)
                    )
                        return false;

                    errorhandler({
                        message: 'Youtube request run into Timeout.',
                        fatal: err.errno === 'ECONNREFUSED' ? false : true,
                        err,
                        id: 1694433409,
                    });
                    return reject(err);
                });
        });
    }

    handlePremiere(time) {
        return new Promise((resolve) => {
            const isLiveNow = time?.isLiveNow;
            if (!isLiveNow) return resolve(false);

            const year = time.startTimestamp.substring(0, 4);
            const month = time.startTimestamp.substring(5, 7) - 1;
            const day = time.startTimestamp.substring(8, 10);
            const hour = time.startTimestamp.substring(11, 13) - 1;
            const date = new Date(year, month, day, hour);

            resolve(date.getTime() / 1000);
        });
    }

    generateMessageContent(isALiveVideoOrPremiere, premiereStartsIn, pingrole) {
        return (
            pingrole +
            `${
                isALiveVideoOrPremiere && premiereStartsIn
                    ? `\n**Premiere starts in <t:${premiereStartsIn}:R>**`
                    : ''
            }`
        );
    }

    generateEmbed(videoDetails) {
        return new Promise(async (resolve) => {
            const embed = await new Notification().geneateNotificationEmbed({
                title: videoDetails.title ? videoDetails.title.substring(0, 250) : 'No title',
                description: videoDetails.description
                    ? videoDetails.description.substring(0, 500)
                    : '',
                url: videoDetails.video_url,
                image: videoDetails.thumbnails.splice(-1)[0].url,
                thumbnail: videoDetails?.author.thumbnails?.splice(-1)[0]?.url,
                color: '#ff0000',
                footer: {
                    text: `Subscribers ${videoDetails.author.subscriber_count} | Views ${videoDetails.viewCount} | Length ${videoDetails.lengthSeconds}s | ${videoDetails.author.name}`,
                },
                author: {
                    name: `${videoDetails.author.name} just uploaded a new video!`,
                    url: videoDetails.author.channel_url,
                },
                timestamp: true,
            });
            resolve(embed);
        });
    }

    updateEmbed(video, messageId, guildId, channelId, ytChannelId) {
        return new Promise(async (resolve) => {
            const videoDetails = await this.getVideoInfos(video.link);
            const { channel, guild } = await this.getServerInfos(guildId, channelId);
            if (!channel) return resolve(false);

            const message = await channel.messages.fetch(messageId).catch(() => {
                return null;
            });

            if (!message || typeof message !== Message) {
                return resolve(false);
            }

            const embed = await this.generateEmbed(videoDetails, ytChannelId, guildId);

            await this.notificationApi
                .updateNotification({
                    embed: embed,
                    message: message,
                })
                .then(async () => {
                    await this.updateUploads({
                        messageId: messageId,
                        guildId: guildId,
                        channelId: channelId,
                        ytChannelId: ytChannelId,
                    });
                })
                .catch((err) => {
                    this.updateUpdateCount(messageId);

                    errorhandler({
                        err: `I have failed to update a youtube upload message to ${channel.name}(${channel.id}) in ${guild.name} (${guild.id})) | ${err.message} | message: ${message?.content}`,
                        fatal: true,
                    });
                    return false;
                });
        });
    }

    getServerInfos(guildId, channelId) {
        return new Promise(async (resolve) => {
            const guild = await this.bot.guilds.cache.get(guildId);
            if (!guild) return resolve(false);
            const channel = await guild.channels.cache.get(channelId);
            if (!channel) return resolve(false);

            return resolve({
                guild,
                channel,
            });
        });
    }
};
