const request = new (require('rss-parser'))();
const { Message } = require('discord.js');
const guildUploads = require('../../../../../src/db/Models/tables/guildUploads.model');
const { errorhandler } = require('../../../errorhandler/errorhandler');
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
                console.info("🔎 Youtube upload handler Interval has ended because there are no uploads to check");
                return false;
            }
        
            for (const upload of uploads) {
                if (!upload.channel_id) continue;
        
                const feed = await this.getFeed(upload.channel_id);
        
                if (!feed) continue;
        
                const uploadedVideos = upload.uploads || [];
        
                const videoAlreadyExists = uploadedVideos.includes(feed.items[0].link);
                if (videoAlreadyExists) {
                    if (!this.isLongerThanXh(upload.updatedAt)) continue;
                    await this.updateEmbed(
                        feed.items[0],
                        upload.messageId,
                        upload.guild_id,
                        upload.info_channel_id
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
                    isEveryone = pingrole.name === "@everyone";
                }
                const ping = pingrole ? (isEveryone ? "@everyone " : `${pingrole}`) : "";
        
                const premiereStartsIn = this.handlePremiere(videoDetails?.liveBroadcastDetails);
        
                const embedContent = this.generateMessageContent(
                    videoDetails?.liveBroadcastDetails,
                    premiereStartsIn,
                    ping
                );
        
                const embed = await this.generateEmbed(videoDetails);
        
                try {
                    const message = await this.notificationApi.sendNotification({
                        channel,
                        content: embedContent,
                        embed: embed,
                    });
        
                    if (message instanceof Message) {
                        await this.updateUploads({
                            guildId: upload.guild_id,
                            channelId: upload.channel_id,
                            uploads: uploadedVideos,
                            messageId: message.id,
                        });
                    }
        
                    console.log(`📥 New upload sent! GUILD: ${upload.guild_id} CHANNEL ID: ${upload.info_channel_id} YOUTUBE LINK: ${feed.items[0].link}`);
                } catch (err) {
                    console.error(`I have failed to send a youtube upload message to ${channel.name} (${channel.id}) in ${guild.name} (${guild.id})`);
                    continue;
                }
            }
        
            console.info("🔎 Youtube upload handler Interval has finished");
            return true;
        } catch (err) {
            errorhandler({
                message: `CODE: ${err.code} ERRNO: ${err.errno}`,
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
            `${isALiveVideoOrPremiere ? `\n**Premiere starts in <t:${premiereStartsIn}:R>**` : ''}`
        );
    }

    generateEmbed(videoDetails) {
        return new Promise(async (resolve) => {
            const embed = await new Notification().geneateNotificationEmbed({
                title: videoDetails.title.substring(0, 250),
                description: videoDetails.description.substring(0, 500),
                url: videoDetails.video_url,
                image: videoDetails.thumbnails.splice(-1)[0].url,
                thumbnail: videoDetails.author.thumbnails.splice(-1)[0].url,
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

    updateEmbed(video, messageId, guildId, channelId) {
        return new Promise(async (resolve) => {
            const videoDetails = await this.getVideoInfos(video.link);
            const { channel, guild } = await this.getServerInfos(guildId, channelId);
            if (!channel) return resolve(false);

            const message = await channel.messages.fetch(messageId);
            const embed = await this.generateEmbed(videoDetails);

            await this.notificationApi
                .updateNotification({
                    embed: embed,
                    message: message,
                })
                .then(async () => {
                    await this.updateUploads({
                        guildId: guildId,
                        channelId: channelId,
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
