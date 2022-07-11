const {
    MessageEmbed
} = require("discord.js");
const ytdl = require('ytdl-core');

module.exports.run = async (bot, message, args) => {
    if (message.guild.id !== '978916743097491466') return;

    const video_link = "https://www.youtube.com/watch?v=BmjBU0IIR0k"

    let info = await ytdl.getInfo(video_link);
    const lastUploadEmbed = new MessageEmbed()
        .setTitle(info.videoDetails.title)
        .setURL(video_link)
        .setImage(info.videoDetails.thumbnails[3].url)

    return message.reply({
        content: video_link,
        embeds: [lastUploadEmbed]
    }).catch(err => {})
}

module.exports.help = {
    name: "camera"
}