const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const Music = require('../../../utils/functions/data/Music');

module.exports.run = async ({ main_interaction, bot }) => {
    const musicApi = new Music(main_interaction, bot);

    await main_interaction.deferReply({
        ephemeral: true,
    });

    if (!(await musicApi.isUserInChannel()))
        return main_interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('You must be in a voice channel to use this command!'),
            ],
            ephemeral: true,
        });

    const queue = await musicApi.getQueue();

    if (!queue)
        return main_interaction.followUp({
            embeds: [
                new EmbedBuilder().setColor('#ff0000').setDescription('There is no song queued!'),
            ],
            ephemeral: true,
        });

    const currentTrack = queue.current;
    const tracks = queue.tracks;

    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('Queue')
        .setDescription(`Now playing: ${currentTrack.title} (${currentTrack.duration})`);

    for (let i = 0; i < 11; i++) {
        if (i === 10) {
            embed.addFields({
                name: `Songs ${i + 1} - ${tracks.length}`,
                value: `...`,
            });
            break;
        }
        embed.addFields({
            name: `Song ${i + 1}`,
            value: `${tracks[i].title} (${tracks[i].duration})`,
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
