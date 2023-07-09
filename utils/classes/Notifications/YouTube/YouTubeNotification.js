const request = new (require('rss-parser'))();
const { Message } = require('discord.js');
const guildUploads = require('~src/db/Models/guildUploads.model');
const { errorhandler } = require('../../../functions/errorhandler/errorhandler');
const Notification = require('../Notifications');
const YouTubeLogic = require('./YouTubeLogic');

module.exports = class YouTubeNotification extends YouTubeLogic {
    constructor() {
        super();
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

                let uploadedVideos = upload.uploads || [];

                const videoAlreadyExists = uploadedVideos.includes(feed.items[0].link);
                if (videoAlreadyExists) {
                    if (!this.isLongerThanXh(upload.updatedAt) || !upload.messageId) continue;
                    await this.updateEmbed(
                        feed.items[0],
                        upload.messageId,
                        upload.guild_id,
                        upload.info_channel_id,
                        upload.channel_id
                    );

                    continue;
                }

                const videoDetails = await this.getVideoInfos(feed.items[0].link);

                if (uploadedVideos.length >= 10) {
                    uploadedVideos = [feed.items[0].link];
                } else {
                    uploadedVideos.push(feed.items[0].link);
                }

                const { channel, guild } = await this.getServerInfos(
                    upload.guild_id,
                    upload.info_channel_id
                );
                if (!channel) continue;

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
                    });

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
                        `📥 New upload sent! GUILD: ${guild.id} CHANNEL ID: ${upload.info_channel_id} YOUTUBE LINK: ${feed.items[0].link}`
                    );
                } catch (err) {
                    console.error(
                        `I have failed to send a youtube upload message to ${channel.name} (${channel.id}) in ${guild.name} (${guild.id})`
                    );
                    continue;
                }
            }

            console.info('🔎 Youtube upload handler Interval has finished');
            return true;
        } catch (err) {
            errorhandler({
                err,
                fatal: true,
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

    generateEmbed(videoDetails, channel, guild_id) {
        return new Promise(async (resolve) => {
            const subs = await this.getSubsDiff(
                videoDetails.author.subscriber_count,
                channel,
                guild_id
            );
            const views = await this.getViewsDiff(videoDetails.viewCount, channel, guild_id);

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
                    text: `Subscribers ${subs} | Views ${views} | Length ${videoDetails.lengthSeconds}s | ${videoDetails.author.name}`,
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

    getViewsDiff(newViews, channel_id, guild_id) {
        return new Promise(async (resolve) => {
            const oldViews = await this.getViews(channel_id, guild_id);
            const diff = newViews - oldViews;
            resolve(`${newViews} (${diff > 0 ? '+' : ''}${diff})`);
        });
    }

    getSubsDiff(newSubs, channel_id, guild_id) {
        return new Promise(async (resolve) => {
            const oldSubs = await this.getSubs(channel_id, guild_id);
            const diff = newSubs - oldSubs;
            resolve(`${newSubs} (${diff > 0 ? '+' : ''}${diff})`);
        });
    }

    updateEmbed(video, messageId, guildId, channelId, ytChannelId) {
        return new Promise(async (resolve) => {
            const videoDetails = await this.getVideoInfos(video.link);
            const { channel, guild } = await this.getServerInfos(guildId, channelId);
            if (!channel) return resolve(false);

            const message = await channel.messages.fetch(messageId);
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

                    errorhandler({
                        fatal: false,
                        message: `📥 Upload embed updated! GUILD: ${guildId} CHANNEL ID: ${channelId} YOUTUBE LINK: ${video.link}`,
                    });
                })
                .catch((err) => {
                    errorhandler({
                        message: `I have failed to update a youtube upload message to ${channel.name}(${channel.id}) in ${guild.name} (${guild.id}))`,
                        err: err.message,
                        fatal: false,
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
