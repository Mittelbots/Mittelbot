const axios = require('axios');
const Reddit = require('~utils/classes/Reddit');
const { errorhandler } = require('~utils/functions/errorhandler/errorhandler');
const { EmbedBuilder } = require('discord.js');

const ignoreErroCodes = ['EAI_AGAIN', 'ECONNRESET', 'ECONNREFUSED', 'EHOSTUNREACH', 'EPIPE'];

module.exports.reddit_notifier = async (bot) => {
    setInterval(async () => {
        const reddit = new Reddit();
        const redditSettings = await reddit.getAll();

        redditSettings.forEach(async (setting) => {
            const { guild_id, channel_id, uploads, subreddit, pingrole, allowNSFW } = setting;

            const response = await axios
                .get(`${reddit.baseUrl()}/${subreddit}/new.json?sort=new`)
                .catch((err) => {
                    if (ignoreErroCodes.includes(err.code)) return false;

                    const isFatal = true;
                    errorhandler({
                        message: 'Error getting reddit post',
                        err: isFatal ? err : null,
                        isFatal: isFatal,
                    });
                    return false;
                });
            if (!response.data) return;

            const { data } = response;
            const { children } = data.data;
            const { data: post } = children[0];
            const {
                title,
                url,
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

            const message = global.t.trans(
                [
                    'info.notifications.reddit.new_post',
                    pingrole ? '<@&' + pingrole + '> || ' : '',
                    subreddit,
                    `https://www.reddit.com${permalink}`,
                ],
                guild.id
            );
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
                let newSelftext;

                if (selftext.length > 1024) newSelftext = selftext.substring(0, 1024) + '...';
                else newSelftext = selftext;
                newEmbed.setDescription(newSelftext);
            }

            if (over_18 && !allowNSFW && !channel.nsfw) {
                newEmbed.setColor(global.t.trans(['general.colors.error']));
                newEmbed.addFields(
                    global.t.trans(['info.notifications.reddit.nsfwInfo'], guild.id)
                );
            } else {
                newEmbed.setColor(global.t.trans(['general.colors.info']));

                try {
                    newEmbed.setImage(url);
                } catch (e) {
                    // do nothing
                }
            }

            await channel
                .send({
                    content: message,
                    embeds: [newEmbed],
                    files: is_video ? [url] : [],
                })
                .then(() => {
                    if (uploads.length > 30) uploads.shift();

                    uploads.push(url);
                    reddit.updateUploads(guild_id, uploads);
                })
                .catch((err) => {
                    errorhandler({
                        message: `Error sending reddit post ${err.message}`,
                        fatal: false,
                        id: 1694432662,
                    });
                });
        });
    }, 1000 * 60); // 15 seconds
};
