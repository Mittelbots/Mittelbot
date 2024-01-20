const guildUploads = require('~src/db/Models/guildUploads.model');
const { errorhandler } = require('../../../functions/errorhandler/errorhandler');
const yt = require('ytdl-core');
const request = new (require('rss-parser'))();
const { google } = require('googleapis');

let youtube;
if (process.env.YT_KEY) {
    youtube = google.youtube({
        version: 'v3',
        auth: process.env.YT_KEY,
    });
} else {
    console.error('===============================');
    console.error('YouTube: No YT_KEY found in .env');
    console.error('YouTube: YouTube notifications will not work');
    console.error('===============================');
}

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

    updateUploads({ guildId, channelId, uploads, messageId, ytChannelId, subs }) {
        return new Promise(async (resolve) => {
            const update = uploads
                ? {
                      uploads: uploads,
                      messageId: messageId,
                      subs: subs,
                  }
                : {
                      updateCount: Math.floor(Math.random() * 200) + 1,
                      subs: subs,
                  };

            const whereCond = ytChannelId
                ? {
                      guild_id: guildId,
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
                .then(() => {
                    return resolve(true);
                })
                .catch((err) => {
                    errorhandler({
                        err,
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
                        err: `Error while getting YouTube Video Informations ${err.message} with link ${link}`,
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
            if (!youtube) return resolve(false);

            const response = await youtube.search.list({
                q: ytchannel,
                part: 'id',
                type: 'channel',
            });

            if (!response.data.items[0]) {
                return resolve(false);
            }
            return resolve(response.data.items[0].id.channelId);
        });
    }

    getSubs(channel_id, guild_id) {
        return new Promise(async (resolve) => {
            const uploads = await guildUploads.findOne({
                where: {
                    guild_id: guild_id,
                    channel_id: channel_id,
                },
            });

            return resolve(uploads.subs);
        });
    }

    updateUpdateCount(messageId) {
        return new Promise(async (resolve) => {
            await guildUploads
                .update(
                    {
                        updateCount: Math.floor(Math.random() * 200) + 1,
                    },
                    {
                        where: {
                            messageId: messageId,
                        },
                    }
                )
                .then(() => {
                    return resolve(true);
                })
                .catch((err) => {
                    errorhandler({
                        err,
                    });
                    return resolve(false);
                });
        });
    }
};
