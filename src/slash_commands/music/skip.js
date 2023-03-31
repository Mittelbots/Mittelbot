const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const Music = require('../../../utils/functions/data/Music');

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

    if (!musicApi.isPlaying())
        return main_interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('There is no song playing right now!'),
            ],
            ephemeral: true,
        });

    if (!queue) {
        return main_interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('There is no song playing right now!'),
            ],
            ephemeral: true,
        });
    }

    const previousTrack = queue.currentTrack;
    const queuedTracks = (await musicApi.getQueuedTracks()).data;

    if (queue.tracks.length > 0) await musicApi.play();
    else await queue.node.skip();

    const nextSong = queuedTracks[0];

    if (!nextSong) {
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#ff0000')
                        .setDescription('Queue ended. Silence...'),
                ],
                ephemeral: true,
            })
            .catch((e) => {});
    }

    return await main_interaction.followUp({
        embeds: [
            new EmbedBuilder().setColor('#00ff00').setDescription(
                `**${previousTrack.title}** has been skipped. 
                    \n----------------------------------------\n
                    Now playing: ${nextSong.title} 
                    Requested by: ${nextSong.requestedBy} 
                    Duration: ${nextSong.duration} 
                    URL: ${nextSong.url}`
            ),
        ],
        ephemeral: true,
    });
};

module.exports.data = new SlashCommandBuilder()
    .setName('skip')
    .setDescription('Skip the current song.');
