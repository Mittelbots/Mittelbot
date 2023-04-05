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
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['error.music.play.notValidInput'],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            })
            .catch((err) => {});
    }

    if (await musicApi.isYoutubeLink(target)) {
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['error.music.play.notSupported'],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            })
            .catch((err) => {});
    }

    const check = await musicApi.checkAvailibility(true);
    if (check) {
        return main_interaction.followUp({
            embeds: [new EmbedBuilder().setColor('#ff0000').setDescription(check)],
            ephemeral: true,
        });
    }

    const queue = await musicApi.createQueue();
    if (!queue) {
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['error.music.play.queueCreate'],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            })
            .catch((err) => {});
    }

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

    if (result.tracks.length === 0) {
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['error.music.play.noResults'],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            })
            .catch((err) => {});
    }

    if (result.playlist) {
        await queue.addTrack(result.tracks);
        embed
            .setDescription(
                global.t.trans(
                    [
                        'success.music.play.playlistAddedToQueue',
                        result.playlist.title,
                        result.playlist.tracks.length,
                    ],
                    main_interaction.guild.id
                )
            )
            .setURL(result.playlist.url)
            .setThumbnail(result.playlist.thumbnail.url)
            .setColor(global.t.trans(['general.colors.success']))
            .setFooter({
                text: global.t.trans(
                    ['success.music.songsInQueue', queue.tracks.size],
                    main_interaction.guild.id
                ),
            });
    } else {
        await queue.addTrack(result.tracks[0]);
        embed
            .setDescription(
                global.t.trans(
                    [
                        'success.music.play.playlistAddedToQueue',
                        result.tracks[0],
                        result.tracks[0].url,
                    ],
                    main_interaction.guild.id
                )
            )
            .addFields({
                name: global.t.trans(['info.music.requestedby'], main_interaction.guild.id),
                value: result.tracks[0].requestedBy.username,
            })
            .setThumbnail(result.tracks[0].thumbnail)
            .setFooter({
                text: `${global.t.trans(
                    ['info.music.duration', result.tracks[0].duration],
                    main_interaction.guild.id
                )}\n${global.t.trans(
                    ['info.music.songsInQueue', queue.tracks.size],
                    main_interaction.guild.id
                )}`,
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
                        .followUp({
                            embeds: [
                                new EmbedBuilder()
                                    .setDescription(
                                        global.t.trans(
                                            ['error.music.play.botIsMuted'],
                                            main_interaction.guild.id
                                        )
                                    )
                                    .setColor(global.t.trans(['general.colors.error'])),
                            ],
                            ephemeral: true,
                        })
                        .catch((err) => {});
                    musicApi.pause();
                }
            })
            .catch((err) => {
                errorhandler({
                    err,
                });

                main_interaction
                    .followUp({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(['error.general'], main_interaction.guild.id)
                                )
                                .setColor(global.t.trans(['general.colors.error'])),
                        ],
                        ephemeral: true,
                    })
                    .catch((err) => {});
            });
    } else {
        main_interaction.followUp({
            embeds: [embed],
        });
    }
};

module.exports.data = playConfig;
