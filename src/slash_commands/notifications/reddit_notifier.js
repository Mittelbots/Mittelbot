const { EmbedBuilder } = require('discord.js');
const Reddit = require('~utils/classes/Reddit');
const {
    redditNotifierConfig,
    redditNotifierPerms,
} = require('../_config/notifications/reddit_notifier');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

    const type = main_interaction.options.getSubcommand();

    const subreddit = main_interaction.options.getString('subreddit');
    const channel = main_interaction.options.getChannel('channel');
    const pingrole = main_interaction.options.getRole('pingrole');
    const allow_nsfw = main_interaction.options.getBoolean('allow_nsfw');

    const guild_id = main_interaction.guild.id;

    const reddit = new Reddit();

    const subRedditExists = await reddit.getSubreddit(subreddit);

    if (!subRedditExists) {
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['error.notifications.reddit.doesNotExistsOrIsPrivate', subreddit],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            })
            .catch(() => {});
    }
    if (allow_nsfw && !channel.nsfw) {
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['error.notifications.reddit.isNsfw', channel.name],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            })
            .catch(() => {});
    }

    const subredditName = subRedditExists;

    const hasGuildAlready = await reddit.get(guild_id);

    if (type === 'remove') {
        if (!hasGuildAlready) {
            return main_interaction
                .followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(
                                    [
                                        'error.notifications.reddit.doesNotExistsOrIsPrivate',
                                        subredditName,
                                    ],
                                    main_interaction.guild.id
                                )
                            )
                            .setColor(global.t.trans(['general.colors.error'])),
                    ],
                    ephemeral: true,
                })
                .catch(() => {});
        }

        reddit
            .remove(guild_id)
            .then(async () => {
                await main_interaction
                    .followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(
                                        ['success.notifications.reddit.removed', subredditName],
                                        main_interaction.guild.id
                                    )
                                )
                                .setColor(global.t.trans(['general.colors.success'])),
                        ],
                        ephemeral: true,
                    })
                    .catch(() => {});
            })
            .catch((err) => {
                return main_interaction
                    .followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(
                                        ['error.generalWithMessage', err.message],
                                        main_interaction.guild.id
                                    )
                                )
                                .setColor(global.t.trans(['general.colors.error'])),
                        ],
                        ephemeral: true,
                    })
                    .catch(() => {});
            });
    } else {
        let override = false;

        if (hasGuildAlready) {
            override = true;
            if (hasGuildAlready.subreddit === subredditName) {
                return main_interaction
                    .followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(
                                        [
                                            'error.notifications.reddit.isAlreadyAdded',
                                            subredditName,
                                        ],
                                        main_interaction.guild.id
                                    )
                                )
                                .setColor(global.t.trans(['general.colors.error'])),
                        ],
                        ephemeral: true,
                    })
                    .catch(() => {});
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
            .then(async () => {
                await main_interaction
                    .followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(
                                        ['success.notifications.reddit.added', subredditName],
                                        main_interaction.guild.id
                                    )
                                )
                                .setColor(global.t.trans(['general.colors.success'])),
                        ],
                        ephemeral: true,
                    })
                    .catch(() => {});
            })
            .catch((err) => {
                return main_interaction
                    .followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(
                                        ['error.generalWithMessage', err.message],
                                        main_interaction.guild.id
                                    )
                                )
                                .setColor(global.t.trans(['general.colors.error'])),
                        ],
                        ephemeral: true,
                    })
                    .catch(() => {});
            });
    }
};

module.exports.data = redditNotifierConfig;
module.exports.permissions = redditNotifierPerms;
