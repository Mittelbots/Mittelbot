const request = new(require("rss-parser"))();

const database = require('../../db/db');
const {
    errorhandler
} = require('../../../utils/functions/errorhandler/errorhandler');
const {
    MessageEmbed
} = require("discord.js");
const tables = require('../../db/table.json');

module.exports.handleUploads = async ({
    bot
}) => {

    console.log("🔎 Uploads handler started");

    setInterval(async () => {
        const uploads = await database.query(`SELECT * FROM guild_uploads`).then(async results => {
            return results;
        }).catch(err => {
            errorhandler({
                err,
                fatal: true
            });
            return false;
        })

        if (!uploads || uploads.length === 0) return false;

        for (let i in uploads) {
            if (uploads[i].channel_id) {
                request.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${uploads[i].channel_id}`)
                    .then(async (feed) => {
                        if (uploads.includes(feed.items[0].link)) return;

                        const saved = await database.query(`INSERT INTO guild_uploads (guild_id, link) VALUES (?, ?)`, [uploads[i].guild_id, feed.items[0].link])
                            .catch(err => {
                                errorhandler({
                                    err,
                                    fatal: true
                                });
                                return false;
                            })
                        if (!saved) return;

                        const channel = await bot.channels.cache.get(uploads[i].channel_id);
                        if (!channel) return;

                        const newMessageEmbed = new MessageEmbed()
                            .setTitle(feed.items[0].title)
                            .setURL(feed.items[0].link)
                            .setImage(feed.items[0].enclosure.url)

                        channel.send({
                            embeds: [newMessageEmbed]
                        }).catch(err => {});

                        console.log(`📥 New upload sent!`);
                    }).catch(err => {
                        errorhandler({
                            err,
                            fatal: true
                        });
                        return false;
                    })
            }
        }
    }, 600000);//? 10 minutes
}