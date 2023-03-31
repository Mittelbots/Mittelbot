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

    if (!queue)
        return main_interaction.followUp({
            embeds: [
                new EmbedBuilder().setColor('#ff0000').setDescription('There is no song queued!'),
            ],
            ephemeral: true,
        });

    const currentTrack = queue.currentTrack;
    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('Queue')
        .setDescription(`Now playing: ${currentTrack} (${currentTrack.duration})`);

    const tracks = (await musicApi.getQueuedTracks()).data;
    if (!tracks)
        return main_interaction.followUp({
            embeds: [embed],
            ephemeral: true,
        });

    for (let i = 1; i < 12; i++) {
        if (i === 12) {
            embed.addFields({
                name: `Songs ${i + 1} - ${tracks.size}`,
                value: `...`,
            });
            break;
        }
        embed.addFields({
            name: `Song ${i + 1}`,
            value: `${tracks[i]} (${tracks[i].duration})\n Requested by: ${tracks[i].requestedBy}`,
        });
    }

    return main_interaction.followUp({
        embeds: [embed],
        ephemeral: true,
    });
};

module.exports.data = new SlashCommandBuilder()
    .setName('queue')
    .setDescription('See the current queue.');
