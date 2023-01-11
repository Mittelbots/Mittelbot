const request = new (require('rss-parser'))();
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const guildUploads = require('../../db/Models/tables/guildUploads.model');
const yt = require('ytdl-core');

module.exports.handleUploads = async ({ bot }) => {
    console.info('🔎 Youtube upload handler started');

    setInterval(async () => {
        const uploads = await guildUploads
            .findAll()
            .then((res) => res)
            .catch((err) => {
                errorhandler({
                    err,
                    fatal: true,
                });
                return false;
            });
        if (uploads.length === 0) return false;
        for (let i in uploads) {
            if (uploads[i].channel_id) {
                request
                    .parseURL(
                        `https://www.youtube.com/feeds/videos.xml?channel_id=${uploads[i].channel_id}`
                    )
                    .then(async (feed) => {
                        const uploadedVideos = uploads[i].uploads || [];

                        const videoAlreadyExists = uploadedVideos.includes(feed.items[0].link);
                        if (videoAlreadyExists) return;

                        const isALiveVideoOrPremiere = await yt
                            .getInfo(feed.items[0].link)
                            .then(async (info) => {
                                return info.videoDetails.liveBroadcastDetails;
                            })
                            .catch((err) => {
                                errorhandler({
                                    err,
                                    fatal: true,
                                });
                                return false;
                            });

                        let premiereStartsIn;
                        if (isALiveVideoOrPremiere) {
                            const isLiveNow = isALiveVideoOrPremiere.isLiveNow;
                            if (!isLiveNow) return;

                            const year = isALiveVideoOrPremiere.startTimestamp.substring(0, 4);
                            const month = isALiveVideoOrPremiere.startTimestamp.substring(5, 7) - 1;
                            const day = isALiveVideoOrPremiere.startTimestamp.substring(8, 10);
                            const hour =
                                isALiveVideoOrPremiere.startTimestamp.substring(11, 13) - 1;
                            const date = new Date(year, month, day, hour);
                            premiereStartsIn = date.getTime() / 1000;
                        }

                        uploadedVideos.push(feed.items[0].link);

                        const saved = await guildUploads
                            .update(
                                {
                                    uploads: uploadedVideos,
                                },
                                {
                                    where: {
                                        guild_id: uploads[i].guild_id,
                                        channel_id: uploads[i].channel_id,
                                    },
                                }
                            )
                            .then(() => {
                                return true;
                            })
                            .catch((err) => {
                                errorhandler({
                                    err,
                                    fatal: true,
                                });
                                return false;
                            });
                        if (!saved) return;

                        const guild = await bot.guilds.cache.get(uploads[i].guild_id);
                        if (!guild) return;
                        const channel = await guild.channels.cache.get(uploads[i].info_channel_id);
                        if (!channel) return;

                        const pingrole = guild.roles.cache.get(uploads[i].pingrole);
                        if (pingrole) {
                            var isEveryone = pingrole.name === '@everyone';
                        }

                        channel
                            .send({
                                content:
                                    (pingrole
                                        ? isEveryone
                                            ? '@everyone '
                                            : `<@&${uploads[i].pingrole}> `
                                        : '') +
                                    feed.items[0].title +
                                    ` ${feed.items[0].link} ${
                                        isALiveVideoOrPremiere
                                            ? `\n**Premiere starts in <t:${premiereStartsIn}:R>**`
                                            : ''
                                    }`,
                            })
                            .catch((err) => {});

                        errorhandler({
                            fatal: false,
                            message: `📥 New upload sent! GUILD: ${uploads[i].guild_id} CHANNEL ID: ${uploads[i].info_channel_id} YOUTUBE LINK: ${feed.items[0].link}`,
                        });
                    })
                    .catch((err) => {
                        errorhandler({
                            message: 'Youtube request run into Timeout.',
                            fatal: err.errno === 'ECONNREFUSED' ? false : true,
                            err,
                        });
                        return false;
                    });
            }
        }
    }, 600000); //? 10 minutes
};
