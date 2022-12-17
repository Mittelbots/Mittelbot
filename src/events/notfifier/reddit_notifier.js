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

            const { data } = await axios.get(`${reddit.baseUrl()}/${subreddit}/new.json?sort=new`).catch((err) => {
                errorhandler({message: 'Error getting reddit post', err: err})
                return false
            });
            if(!data) return;

            const { children } = data.data;
            const { data: post } = children[0];
            const { title, url, hidden, over_18, permalink, created_utc, is_video, subreddit_subscribers, author, ups, downs } = post;

            if (uploads.includes(url)) return;
            
            const guild = bot.guilds.cache.get(guild_id);
            if(!guild) return;

            const channel = guild.channels.cache.get(channel_id);
            if(!channel) return;

    
            const message = `${pingrole ? '<@'+pingrole+'>' : ''} Your subreddit \`${subreddit}\` has a new post!`;
            const newEmbed = new EmbedBuilder()
                .setTitle(title)
                .setURL(`https://www.reddit.com${permalink}`)
                .setAuthor({
                    name: author
                })
                .setDescription(`**${ups}** upvotes | **${downs}** downvotes | **${subreddit_subscribers}** subscribers`)
                
                .setFooter({
                    text: `Posted ${new Date(created_utc * 1000).toLocaleString()}`
                })
            
            if(over_18 && !allowNSFW) {
                newEmbed.setColor(15548997);
                newEmbed.addField('NSFW', 'This post is marked as NSFW. Please be careful when viewing it.');
            }else {
                newEmbed
                    .setColor(15105570)
                    .setImage(url)
            }

            await channel.send({
                content: message,
                embeds: [newEmbed]
            }).then(() => {
                uploads.push(url);
                reddit.updateUploads(guild_id, uploads);
            })
            .catch(err => {
                errorhandler({message: 'Error sending reddit post', err: err.message, fatal: false})
            })
        });                 


    }, 1000 * 10); // 10 seconds
}