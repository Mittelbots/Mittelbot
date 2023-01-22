const { SlashCommandBuilder } = require('discord.js');
const Reddit = require('../../../utils/functions/data/Reddit');
const { hasPermission } = require('../../../utils/functions/hasPermissions');

module.exports.run = async ({ main_interaction, bot }) => {
    const hasPerms = await hasPermission({
        guild_id: main_interaction.guild.id,
        adminOnly: true,
        user: main_interaction.user,
        bot,
    });
    if (!hasPerms) {
        return main_interaction.reply({
            content: `⛔️ You do not have permission to use this command`,
            ephemeral: true,
        });
    }

    const type = main_interaction.options.getSubcommand();

    const subreddit = main_interaction.options.getString('subreddit');
    const channel = main_interaction.options.getChannel('channel');
    const pingrole = main_interaction.options.getRole('pingrole');
    const allow_nsfw = main_interaction.options.getBoolean('allow_nsfw');

    const guild_id = main_interaction.guild.id;

    const reddit = new Reddit();

    const subRedditExists = await reddit.getSubreddit(subreddit);

    if (!subRedditExists) {
        return main_interaction.reply({
            content: `The subreddit \`${subreddit}\` does not exist or is private`,
            ephemeral: true,
        });
    }
    if (allow_nsfw && !channel.nsfw) {
        return main_interaction.reply({
            content: `⛔️ The channel \`${channel.name}\` is not marked as NSFW`,
            ephemeral: true,
        });
    }

    const subredditName = subRedditExists;

    const hasGuildAlready = await reddit.get(guild_id);

    if (type === 'remove') {
        if (!hasGuildAlready) {
            return main_interaction.reply({
                content: `The subreddit \`${subredditName}\` is not added to the reddit notifier`,
                ephemeral: true,
            });
        }

        reddit
            .remove(guild_id)
            .then(() => {
                main_interaction.reply({
                    content: `🎉 Removed the subreddit \`${subredditName}\` from the reddit notifier`,
                    ephemeral: true,
                });
            })
            .catch(() => {
                main_interaction.reply({
                    content: `💥 Something went wrong while removing the subreddit \`${subredditName}\` from the reddit notifier`,
                    ephemeral: true,
                });
            });
    } else {
        let override = false;

        if (hasGuildAlready) {
            override = true;
            if (hasGuildAlready.subreddit === subredditName) {
                return main_interaction.reply({
                    content: `The subreddit \`${subredditName}\` is already added to the reddit notifier`,
                    ephemeral: true,
                });
            }
        }

        reddit
            .save({
                guild_id,
                channel_id: channel.id,
                subreddit: subredditName,
                pingrole_id: pingrole.id,
                allow_nsfw,
                override,
            })
            .then(() => {
                main_interaction.reply({
                    content: `🎉 Added the subreddit \`${subredditName}\` to the reddit notifier`,
                    ephemeral: true,
                });
            })
            .catch(() => {
                main_interaction.reply({
                    content: `💥 Something went wrong while adding the subreddit \`${subredditName}\` to the reddit notifier`,
                    ephemeral: true,
                });
            });
    }
};

module.exports.data = new SlashCommandBuilder()
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
            .addRoleOption((option) =>
                option
                    .setName('pingrole')
                    .setDescription('The role you want to ping when a new post is uploaded')
                    .setRequired(true)
            )
            .addBooleanOption((option) =>
                option
                    .setName('allow_nsfw')
                    .setDescription('Allow nsfw posts to be posted in this channel')
                    .setRequired(true)
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
