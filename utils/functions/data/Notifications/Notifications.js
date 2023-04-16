const { EmbedBuilder } = require('discord.js');

module.exports = class Notification {
    constructor() {}

    sendNotification({ channel, content = null, embed = null }) {
        return new Promise((resolve, reject) => {
            if (!channel) return reject('No channel provided.');
            if (!content && !embed) return reject('No content or embed provided.');

            if (content && embed) {
                channel
                    .send({
                        content,
                        embeds: [embed],
                    })
                    .then(resolve)
                    .catch((err) => reject(err));
            } else if (content) {
                channel
                    .send(content)
                    .then(resolve)
                    .catch((err) => reject(err));
            } else if (embed) {
                channel
                    .send({
                        embeds: [embed],
                    })
                    .then(resolve)
                    .catch((err) => reject(err));
            }
            return resolve();
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
        update = false,
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

            if (fields.length > 0) embed.addFields(fields);

            if (timestamp) setTimestamp();

            return resolve(embed);
        });
    }
};
