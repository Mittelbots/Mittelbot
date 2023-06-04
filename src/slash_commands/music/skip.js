const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const Music = require('~utils/classes/Music');
const { skipConfig } = require('../_config/music/skip');

module.exports.run = async ({ main_interaction, bot }) => {
    const musicApi = new Music(main_interaction, bot);

    await main_interaction.deferReply({
        ephemeral: true,
    });

    const check = await musicApi.checkAvailibility();
    if (check) {
        return main_interaction.followUp({
            embeds: [new EmbedBuilder().setColor('#ff0000').setDescription(check)],
            ephemeral: true,
        });
    }

    const queue = await musicApi.getQueue();

    if (!musicApi.isPlaying() || !queue) {
        return await main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(['error.music.nothingPlays'], main_interaction.guild.id)
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            })
            .catch((err) => {});
    }

    if (queue.tracks.length > 0) await musicApi.play();
    else await musicApi.skip();

    const previousTrack = queue.currentTrack;
    const queuedTracks = (await musicApi.getQueuedTracks()).data;

    const nextSong = queuedTracks[0];

    if (!nextSong) {
        return await main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(['warning.music.queueEnded'], main_interaction.guild.id)
                        )
                        .setColor(global.t.trans(['general.colors.warning'])),
                ],
                ephemeral: true,
            })
            .catch((err) => {});
    }

    return await main_interaction
        .followUp({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        global.t.trans(
                            [
                                'success.music.skip.skipped',
                                previousTrack,
                                nextSong.title,
                                nextSong.requestedBy,
                                nextSong.duration,
                                nextSong.url,
                            ],
                            main_interaction.guild.id
                        )
                    )
                    .setColor(global.t.trans(['general.colors.success'])),
            ],
            ephemeral: true,
        })
        .catch((err) => {});
};

module.exports.data = skipConfig;
