const request = new (require('rss-parser'))();
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const guildUploads = require('../../db/Models/tables/guildUploads.model');

module.exports.handleUploads = async ({ bot }) => {
    console.info('🔎 Youtube upload handler started');

    setInterval(async () => {
        const uploads = await guildUploads.findAll()
        .then((res) => res).catch(err => {
            errorhandler({
                err,
                fatal: true,
            });
            return false;
        })

        if (uploads.length === 0) return false;

        for (let i in uploads) {
            if (uploads[i].channel_id) {
                request
                    .parseURL(
                        `https://www.youtube.com/feeds/videos.xml?channel_id=${uploads[i].channel_id}`
                    )
                    .then(async (feed) => {
                        var uploadedVideos =
                            JSON.parse(uploads[i].uploads) || [];

                        const videoAlreadyExists = uploadedVideos.includes(feed.items[0].link);
                        if (videoAlreadyExists) return;

                        uploadedVideos.push(feed.items[0].link);

                        const saved = await guildUploads.update(
                            {
                                uploads: uploadedVideos,
                            },
                            {
                                where: {
                                    guild_id: uploads[i].guild_id,
                                    channel_id: uploads[i].channel_id,
                                },
                            }
                        ).then(() => {
                            return true;    
                        }).catch(err => {
                            errorhandler({
                                err,
                                fatal: true,
                            });
                            return false;
                        })
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
                                    ` ${feed.items[0].link}`,
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
                        });
                        return false;
                    });
            }
        }
    }, 600000); //? 10 minutes
};
