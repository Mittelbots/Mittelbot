const request = new (require("rss-parser"))();

const database = require('../../db/db');
const {
    errorhandler
} = require('../../../utils/functions/errorhandler/errorhandler');
const { ytUploads } = require("../../../utils/functions/cache/cache");

module.exports.handleUploads = async ({
    bot
}) => {

    console.info("🔎 Youtube upload handler started");

    setInterval(async () => {
        var uploads;

        if(ytUploads) {
            uploads = ytUploads[0].list;
        }else {
            uploads = await database.query(`SELECT * FROM guild_uploads`)
            .catch(err => {
                errorhandler({
                    err,
                    fatal: true
                });
                return false;
            })
        }

        if (!uploads || uploads.length === 0) return false;

        for (let i in uploads) {
            if (uploads[i].channel_id) {
                request.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${uploads[i].channel_id}`)
                    .then(async (feed) => {
                        try {
                            var uploadedVideos = JSON.parse(uploads[i].uploads);
                        }catch(err) {
                            uploadedVideos = uploads[i].uploads;
                        }

                        const videoAlreadyExists = uploadedVideos.includes(feed.items[0].link);
                        if (videoAlreadyExists) return;

                        uploadedVideos.push(feed.items[0].link)

                        const saved = await database.query(`UPDATE guild_uploads SET uploads = ? WHERE guild_id = ? AND channel_id = ?`, [JSON.stringify(uploadedVideos), uploads[i].guild_id, uploads[i].channel_id])
                            .then(() => {
                                for(let i in ytUploads) {
                                    if(ytUploads[i].guild_id === uploads[i].guild_id && ytUploads[i].channel_id === uploads[i].channel_id) {
                                        ytUploads[i].uploads = uploadedVideos;
                                    }
                                }
                            })
                            .catch(err => {
                                errorhandler({
                                    err,
                                    fatal: true
                                });
                                return false;
                            })
                        if (!saved) return;

                        const guild = await bot.guilds.cache.get(uploads[i].guild_id)
                        if (!guild) return;
                        const channel = await guild.channels.cache.get(uploads[i].info_channel_id);
                        if (!channel) return;


                        const pingrole = guild.roles.cache.get(uploads[i].pingrole);
                        if(pingrole) {
                            var isEveryone = pingrole.name === '@everyone';
                        }

                        channel.send({
                            content: ((pingrole) ? (isEveryone) ? '@everyone ' : `<@&${uploads[i].pingrole}> ` : '') + feed.items[0].title + ` ${feed.items[0].link}`,
                        }).catch(err => {});

                        console.info(`📥 New upload sent! GUILD: ${uploads[i].guild_id} CHANNEL ID: ${uploads[i].info_channel_id}`);
                    }).catch(err => {
                        errorhandler({
                            err,
                            fatal: true
                        });
                        return false;
                    })
            }
        }
    }, 600000); //?  10 minutes
}