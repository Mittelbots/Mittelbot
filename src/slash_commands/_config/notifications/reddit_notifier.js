const { SlashCommandBuilder } = require('discord.js');

module.exports.redditNotifierConfig = new SlashCommandBuilder()
    .setName('reddit_notifier')
    .setDescription('Add or remove a subreddit from the reddit notifier of your guild')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('add')
            .setDescription('Add a subreddit to the reddit notifier')
            .addStringOption((option) =>
                option
                    .setName('subreddit')
                    .setDescription('The name or a link of the subreddit you want to add')
                    .setRequired(true)
            )
            .addChannelOption((option) =>
                option
                    .setName('channel')
                    .setDescription('The channel you want to post the reddit posts in')
                    .setRequired(true)
            )
            .addBooleanOption((option) =>
                option
                    .setName('allow_nsfw')
                    .setDescription('Allow nsfw posts to be posted in this channel')
                    .setRequired(true)
            )
            .addRoleOption((option) =>
                option
                    .setName('pingrole')
                    .setDescription('The role you want to ping when a new post is uploaded')
                    .setRequired(false)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('remove')
            .setDescription('Remove a subreddit from the reddit notifier')
            .addStringOption((option) =>
                option
                    .setName('subreddit')
                    .setDescription('The subreddit you want to remove')
                    .setRequired(true)
            )
    );
