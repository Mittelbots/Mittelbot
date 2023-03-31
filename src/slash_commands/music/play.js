const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const Music = require('../../../utils/functions/data/Music');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const { playConfig } = require('../_config/music/play');

module.exports.run = async ({ main_interaction, bot }) => {
    const musicApi = new Music(main_interaction, bot);

    await main_interaction.deferReply({
        ephemeral: true,
    });

    const target = main_interaction.options.getString('target');

    if (target.length < 3) {
        return main_interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('Please send a valid link or song name.'),
            ],
            ephemeral: true,
        });
    }

    if (await musicApi.isYoutubeLink(target)) {
        return main_interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription(
                        'I do not support any YouTube links due some legal issues. Please provide a spotify or soundcloud link.'
                    ),
            ],
            ephemeral: true,
        });
    }

    const check = await musicApi.checkAvailibility(true);
    if (check) {
        return main_interaction.followUp({
            embeds: [new EmbedBuilder().setColor('#ff0000').setDescription(check)],
            ephemeral: true,
        });
    }

    const queue = await musicApi.createQueue();
    if (!queue)
        return main_interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('There was an error while creating the queue.'),
            ],
            ephemeral: true,
        });

    const embed = new EmbedBuilder();

    let url;

    try {
        url = new URL(target);
    } catch (error) {
        url = {
            host: '',
        };
    }
    let result;
    switch (true) {
        case url.host === 'open.spotify.com' ||
            url.host === 'spotify.com' ||
            url.host === 'www.spotify.com' ||
            url.host === 'play.spotify.com':
            result = await musicApi.spotifySearch(target);
            break;
        case url.host === 'soundcloud.com' ||
            url.host === 'www.soundcloud.com' ||
            url.host === 'm.soundcloud.com':
            result = await musicApi.soundcloudSearch(target);
            break;
        default:
            result = await musicApi.defaultSearch(target);
            break;
    }

    if (result.tracks.length === 0)
        return main_interaction.followUp({
            embeds: [
                embed
                    .setColor('#ff0000')
                    .setDescription('No results for this song. Be sure to send a valid link.'),
            ],
        });

    if (result.playlist) {
        await queue.addTrack(result.tracks);
        embed
            .setDescription(
                `**${result.playlist.title}** with ${result.playlist.tracks.length} Songs has been added to the Queue`
            )
            .setURL(result.playlist.url)
            .setThumbnail(result.playlist.thumbnail.url)
            .setColor('#00ff00')
            .setFooter({
                text: `Songs in Queue: ${queue.tracks.size}`,
            });
    } else {
        await queue.addTrack(result.tracks[0]);
        embed
            .setDescription(
                `**[${result.tracks[0]}](${result.tracks[0].url})** has been added to the Queue`
            )
            .addFields({
                name: 'Requested by',
                value: result.tracks[0].requestedBy.username,
            })
            .setThumbnail(result.tracks[0].thumbnail)
            .setFooter({
                text: `Duration: ${result.tracks[0].duration}\nSongs in Queue: ${queue.tracks.size}`,
            });
    }

    if (!(await musicApi.isPlaying())) {
        await musicApi
            .play()
            .then(async () => {
                await main_interaction.followUp({
                    embeds: [embed],
                });
            })
            .then(async () => {
                if (await musicApi.isBotMuted()) {
                    await main_interaction
                        .reply({
                            embeds: [
                                new EmbedBuilder()
                                    .setColor('#ff0000')
                                    .setDescription(
                                        "I'm muted, please unmute me to use this command."
                                    ),
                            ],
                        })
                        .catch((err) => {});
                    musicApi.pause();
                }
            })
            .catch((err) => {
                errorhandler({
                    err,
                });

                main_interaction.followUp({
                    content: 'An error occured while playing the song',
                    ephemeral: true,
                });
            });
    } else {
        main_interaction.followUp({
            embeds: [embed],
        });
    }
};

module.exports.data = playConfig;
