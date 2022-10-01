const { EmbedBuilder } = require("discord.js");
const ytdl = require('ytdl-core');
const { errorhandler } = require("../../../utils/functions/errorhandler/errorhandler");
const config = require('../../../src/assets/json/_config/config.json');
const request = new(require("rss-parser"))();

module.exports.run = async (bot, message, args) => {
    if(message.guild.id !== '978916743097491466' && !JSON.parse(process.env.DEBUG)) return;
    
    const channel_id = "UCw9Y1aRo7z93z4oYX8R7w9Q"

    request.parseURL(`https://www.youtube.com/feeds/videos.xml?channel_id=${channel_id}`)
        .then(async feed => {
            let info = await ytdl.getInfo(feed.items[0].link);
            const lastUploadEmbed = new EmbedBuilder()
            .setTitle(feed.items[0].title)
            .setURL(feed.items[0].link)
            .setImage(info.videoDetails.thumbnails[3].url)

            return message.reply({
                content: feed.items[0].link,
                embeds: [lastUploadEmbed]
            }).catch(err => {})
        })
        .catch(err => {
            errorhandler({err, fatal: true});
        })
}

module.exports.help = {
    name: "lastupload"
}