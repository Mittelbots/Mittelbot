const { SlashCommandBuilder } = require('discord.js');
const Reddit = require('../../../utils/functions/data/Reddit');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { redditNotifierConfig } = require('../_config/notifications/reddit_notifier');

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
                pingrole_id: pingrole ? pingrole.id : null,
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

module.exports.data = redditNotifierConfig;
