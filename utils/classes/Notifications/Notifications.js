const { Message } = require('discord.js');
const { EmbedBuilder } = require('discord.js');

module.exports = class Notification {
    constructor() {}

    async sendNotification({ channel, content = null, embed = null, components = null }) {
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
                return reject(err);
            }
        });
    }

    updateNotification({ message, embed = null }) {
        return new Promise((resolve, reject) => {
            if (!message && !embed) return reject('No message, content or embed provided.');
            if (!message instanceof Message) {
                return reject('Message is not a valid message object.');
            }

            message
                .edit({
                    embeds: [embed],
                })
                .then((msg) => resolve(msg))
                .catch((err) => reject(err));
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

            if (fields) {
                if (fields.length > 0) embed.addFields(fields);
            }

            if (timestamp) embed.setTimestamp();

            return resolve(embed);
        });
    }
};
