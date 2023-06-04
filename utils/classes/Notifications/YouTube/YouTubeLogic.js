const guildUploads = require('@/src/db/Models/guildUploads.model');
const { errorhandler } = require('../../../functions/errorhandler/errorhandler');
const yt = require('ytdl-core');
const request = new (require('rss-parser'))();
const { channelId } = require('@gonetone/get-youtube-id-by-url');

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

    updateUploads({ guildId, channelId, uploads, messageId, ytChannelId }) {
        return new Promise(async (resolve) => {
            const update = uploads
                ? {
                      uploads: uploads,
                      messageId: messageId,
                  }
                : {
                      updateCount: Math.floor(Math.random() * 200) + 1,
                  };

            const whereCond = ytChannelId
                ? {
                      guild_id: guildId,
                      channel_id: channelId,
                      channel_id: ytChannelId,
                  }
                : {
                      guild_id: guildId,
                      channel_id: channelId,
                  };

            await guildUploads
                .update(update, {
                    where: whereCond,
                })
                .then((res) => {
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
        const diff = now - new Date(updatedAt).getTime() / 1000;
        return diff >= this.updateTime / 1000;
    }

    getUploads(channelId) {
        return new Promise(async (resolve) => {
            await request.parseURL(this.baseURL + channelId).then(async (feed) => {
                if (!feed.items[0]) {
                    return resolve([]);
                }

                return resolve(feed.items);
            });
        });
    }

    getChannelId(ytchannel) {
        return new Promise(async (resolve) => {
            const url = new URL('https://www.youtube.com' + '/@' + ytchannel);
            if (url.pathname === '/@') {
                return resolve(false);
            }

            const channelid = await channelId(url.href)
                .then((id) => {
                    return id;
                })
                .catch(() => {
                    return false;
                });

            return resolve(channelid);
        });
    }
};
