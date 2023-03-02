const axios = require('axios');
const Reddit = require('../../../utils/functions/data/Reddit');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const { EmbedBuilder } = require('@discordjs/builders');

module.exports.reddit_notifier = async (bot) => {
    setInterval(async () => {
        const reddit = new Reddit();
        const redditSettings = await reddit.getAll();

        redditSettings.forEach(async (setting) => {
            const { guild_id, channel_id, uploads, subreddit, pingrole, allowNSFW } = setting;

            const { data } = await axios
                .get(`${reddit.baseUrl()}/${subreddit}/new.json?sort=new`)
                .catch((err) => {
                    errorhandler({ message: 'Error getting reddit post', err: err });
                    return false;
                });
            if (!data) return;

            const { children } = data.data;
            const { data: post } = children[0];
            const {
                title,
                url,
                hidden,
                selftext,
                over_18,
                permalink,
                created_utc,
                is_video,
                subreddit_subscribers,
                author,
                ups,
                downs,
            } = post;

            if (uploads.includes(url)) return;

            const guild = bot.guilds.cache.get(guild_id);
            if (!guild) return;

            const channel = guild.channels.cache.get(channel_id);
            if (!channel) return;

            const message = `${
                pingrole ? '<@&' + pingrole + '> || ' : ''
            }The subreddit \`${subreddit}\` has a new post!\n\n https://www.reddit.com${permalink}`;
            const newEmbed = new EmbedBuilder()
                .setTitle(title.substring(0, 256))
                .setURL(`https://www.reddit.com${permalink}`)
                .setAuthor({
                    name: author,
                })

                .setFooter({
                    text: `Posted ${new Date(
                        created_utc * 1000
                    ).toLocaleString()} || ${ups} upvotes | ${downs} downvotes | ${subreddit_subscribers} subscribers`,
                });

            if (selftext) {
                if (selftext.length > 1024) selftext = selftext.substring(0, 1024) + '...';
                newEmbed.setDescription(selftext);
            }

            if (over_18 && !allowNSFW && !channel.nsfw) {
                newEmbed.setColor(15548997);
                newEmbed.addFields({
                    name: '🔞 NSFW',
                    value: 'This post is marked as NSFW. Please be careful when viewing it.',
                });
            } else {
                newEmbed.setColor(15105570).setImage(url);
            }

            await channel
                .send({
                    content: message,
                    embeds: [newEmbed],
                })
                .then(() => {
                    if (uploads.length > 30) uploads.shift();

                    uploads.push(url);
                    reddit.updateUploads(guild_id, uploads);
                })
                .catch((err) => {
                    errorhandler({
                        message: 'Error sending reddit post',
                        err: err.message,
                        fatal: false,
                    });
                });
        });
    }, 1000 * 15); // 15 seconds
};
