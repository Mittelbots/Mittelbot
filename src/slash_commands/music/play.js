const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const Music = require('~utils/classes/Music');
const { errorhandler } = require('~utils/functions/errorhandler/errorhandler');
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

    const host = await musicApi.getURLHost(url);
    let result;
    if (host === 'spotify') {
        result = await musicApi.spotifySearch(target, main_interaction.user.id);
    } else if (host === 'soundcloud') {
        result = await musicApi.soundcloudSearch(target);
    } else {
        result = await musicApi.defaultSearch(target);
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

    let isAMultipleSearch = false;

    if (result.playlist) {
        await musicApi.addTrack(result.tracks);
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
        const searchLength = result.tracks.length;
        let playTrack;

        if (searchLength > 1) {
            isAMultipleSearch = true;

            const response = await musicApi.searchResults(result.tracks);
            await main_interaction.followUp({
                embeds: [response.embed],
                components: [response.row],
                ephemeral: true,
            });

            const maxTimeout = 30000;

            const filter = (i) =>
                i.user.id === main_interaction.user.id && i.customId.startsWith('searchResult_');
            const collector = main_interaction.channel.createMessageComponentCollector({
                filter,
                time: maxTimeout,
            });

            await collector.on('collect', async (interacion) => {
                const url = interacion.customId.split('_')[1];
                playTrack = result.tracks.find((t) => t.url === url);

                await interacion.deferUpdate().catch((err) => {});
            });

            collector.on('end', async (collected, reason) => {
                return;
            });

            while (!playTrack) {
                await new Promise((r) => setTimeout(r, 500));

                if (playTrack) break;

                setTimeout(() => {
                    if (!playTrack) playTrack = result.tracks[0];
                }, maxTimeout);
            }
        } else {
            playTrack = result.tracks[0];
        }

        await musicApi.addTrack(playTrack);
        embed
            .setDescription(
                global.t.trans(
                    ['success.music.play.songAddedToQueue', playTrack, playTrack],
                    main_interaction.guild.id
                )
            )
            .addFields({
                name: global.t.trans(['info.music.requestedby'], main_interaction.guild.id),
                value: main_interaction.user.username,
            })
            .setThumbnail(playTrack.thumbnail)
            .setFooter({
                text: `${global.t.trans(
                    ['info.music.duration', playTrack.duration],
                    main_interaction.guild.id
                )}\n${global.t.trans(
                    ['info.music.songsInQueue', queue.tracks.size],
                    main_interaction.guild.id
                )}`,
            });
    }

    if (!(await musicApi.isPlaying()) && !(await musicApi.isPaused())) {
        await musicApi
            .play()
            .then(async () => {
                if (isAMultipleSearch) {
                    await main_interaction.editReply({
                        embeds: [embed],
                        components: [],
                    });
                    return;
                }
                main_interaction.followUp({
                    embeds: [embed],
                });

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

                musicApi.pause();
            });
    } else {
        if (isAMultipleSearch) {
            await main_interaction.editReply({
                embeds: [embed],
                components: [],
            });
            return;
        }
        main_interaction.followUp({
            embeds: [embed],
        });
    }
};

module.exports.data = playConfig;
