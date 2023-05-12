const guildUploads = require('../../../../../src/db/Models/tables/guildUploads.model');
const { errorhandler } = require('../../../errorhandler/errorhandler');
const yt = require('ytdl-core');

module.exports = class YouTubeLogic {
    bot;

    ignoreErrorCodes = ['404'];
    ignoreErrorNames = [
        'ECONNRESET',
        'ETIMEDOUT',
        'ECONNREFUSED',
        'EHOSTUNREACH',
        'EPIPE',
        'ENOTFOUND',
    ];

    interval = 1000 * 60; // 1 minute
    updateTime = 1000 * 60 * 60 * 2; // 2 hours

    baseURL = 'https://www.youtube.com/feeds/videos.xml?channel_id=';

    constructor() {}

    updateUploads({ guildId, channelId, uploads, messageId }) {
        return new Promise(async (resolve) => {
            await guildUploads
                .update(
                    {
                        uploads: uploads,
                        messageId: messageId,
                    },
                    {
                        where: {
                            guild_id: guildId,
                            channel_id: channelId,
                        },
                    }
                )
                .then(() => {
                    return resolve(true);
                })
                .catch((err) => {
                    errorhandler({
                        err,
                        fatal: true,
                    });
                    return resolve(false);
                });
        });
    }

    getVideoInfos(link) {
        return new Promise(async (resolve) => {
            await yt
                .getInfo(link)
                .then(async (info) => {
                    return resolve(info.videoDetails);
                })
                .catch((err) => {
                    errorhandler({
                        message: link,
                        err,
                        fatal: true,
                    });
                    return resolve(false);
                });
        });
    }

    isLongerThanXh(updatedAt) {
        const now = new Date().getTime() / 1000;
        const diff = now - updatedAt;
        return diff > this.updateTime;
    }
};
