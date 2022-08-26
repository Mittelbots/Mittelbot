const {
    EmbedBuilder
} = require("discord.js");
const ytdl = require('ytdl-core');
const config = require('../../../src/assets/json/_config/config.json');

module.exports.run = async (bot, message, args) => {
    if (message.guild.id !== '978916743097491466' && !config.debug) return;

    const video_link = "https://www.youtube.com/watch?v=BmjBU0IIR0k"

    let info = await ytdl.getInfo(video_link);
    const lastUploadEmbed = new EmbedBuilder()
        .setTitle(info.videoDetails.title)
        .setURL(video_link)
        .setImage(info.videoDetails.thumbnails[3].url)

    const camera_setting = `**The best camera setting for F1 2022**\n
Camera: **TV Pod Offset**
Field of view: **1**
Offset Lateral: **-12**
Offset Horizontal: **20**
Offset Vertical: **-5**
Angle: **5**
Near Clip Plane: **1**
Mirror Angle: **-1**
Camera Shake: **4**
Camera Movement: **4**
Lock to Apex Limit: **4**
Halo Column: **On**`

    return message.reply({
        content: camera_setting,
        embeds: [lastUploadEmbed]
    }).catch(err => {})
}

module.exports.help = {
    name: "camera"
}