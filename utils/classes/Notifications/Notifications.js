const { Message } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const YouTubeSettings = require('./YouTube/YouTubeSettings');
const TwitchNotifier = require('./Twitch/TwitchLogic');

module.exports = class Notification {
    constructor() {}

    async sendNotification({
        channel,
        content = null,
        embed = null,
        components = null,
        channel_id = null,
        type = '',
    }) {
        return new Promise(async (resolve, reject) => {
            if (!channel) reject('No channel provided.');
            if (!content && !embed) reject('No content or embed provided.');

            const options = {};
            if (content) options.content = content;
            if (embed) options.embeds = [embed];
            if (components) options.components = components;

            try {
                const msg = await channel.send(options);
                return resolve(msg);
            } catch (err) {
                if (channel_id && err.status === 403) {
                    if (type === 'yt') {
                        new YouTubeSettings(channel.guild.id).remove({
                            guild_id: channel.guild.id,
                            channel_id: channel_id,
                        });
                        return reject(
                            'I do not have permission to send messages in that channel. I have removed the channel from the YouTube settings.'
                        );
                    } else if (type === 'twitch') {
                        new TwitchNotifier().delete(channel.guild.id, channel_id);
                        return reject(
                            'I do not have permission to send messages in that channel. I have removed the channel from the Twitch settings.'
                        );
                    }
                }
                return reject(err);
            }
        });
    }

    updateNotification({ message, embed = null }) {
        return new Promise((resolve, reject) => {
            if (!message && !embed) return reject('No message, content or embed provided.');
            if ((!message) instanceof Message) {
                return reject('Message is not a valid message object.');
            }

            try {
                message
                    .edit({
                        embeds: [embed],
                    })
                    .then((msg) => resolve(msg));
            } catch (error) {
                message
                    .update({
                        embeds: [embed],
                    })
                    .then((msg) => resolve(msg))
                    .catch((err) => reject(err));
            }
        });
    }

    geneateNotificationEmbed({
        title = '',
        description = '',
        color = '',
        footer = {
            text: '',
            icon: '',
        },
        thumbnail = '',
        image = '',
        url = '',
        fields = [],
        author = {
            name: '',
            icon: '',
            url: '',
        },
        timestamp = false,
        embed = new EmbedBuilder(),
    }) {
        return new Promise((resolve, reject) => {
            if (!title && !description) return reject('No title or description provided.');

            if (title) embed.setTitle(title);
            if (description) embed.setDescription(description);
            if (color) embed.setColor(color);
            if (thumbnail) embed.setThumbnail(thumbnail);
            if (image) embed.setImage(image);
            if (url) embed.setURL(url);

            if (footer)
                embed.setFooter({
                    text: footer.text,
                    icon: footer.icon,
                });
            if (author)
                embed.setAuthor({
                    name: author.name,
                    icon: author.icon,
                    url: author.url,
                });

            if (fields && fields.length > 0) {
                embed.addFields(fields);
            }

            if (timestamp) embed.setTimestamp();

            return resolve(embed);
        });
    }
};
