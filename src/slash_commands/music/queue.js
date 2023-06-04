const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const Music = require('~utils/classes/Music');
const { queueConfig } = require('../_config/music/queue');

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

    if (!queue) {
        return main_interaction
            .followUp({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                ['error.music.nothingInQueue'],
                                main_interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.error'])),
                ],
                ephemeral: true,
            })
            .catch((err) => {});
    }

    const currentTrack = queue.currentTrack;
    const embed = new EmbedBuilder()
        .setColor('#00ff00')
        .setTitle('Queue')
        .setDescription(
            global.t.trans(
                [
                    'info.music.nowplaying',
                    currentTrack,
                    currentTrack ? currentTrack.requestedBy : 'Unknown',
                    currentTrack.url,
                ],
                main_interaction.guild.id
            )
        );

    const tracks = (await musicApi.getQueuedTracks()).data;
    if (!tracks || tracks.length === 0)
        return main_interaction.followUp({
            embeds: [embed],
            ephemeral: true,
        });

    for (let i = 1; i < 12; i++) {
        if (i === 12) {
            embed.addFields({
                name: global.t.trans(
                    ['info.music.queue.queueLength', i + 1, tracks.size],
                    main_interaction.guild.id
                ),
                value: `...`,
            });
            break;
        }
        embed.addFields({
            name: global.t.trans(
                ['info.music.queue.songEmbedName', i + 1],
                main_interaction.guild.id
            ),
            value: global.t.trans(
                [
                    'info.music.queue.songEmbedValue',
                    tracks[i],
                    tracks[i].duration,
                    tracks[i].requestedBy,
                ],
                main_interaction.guild.id
            ),
        });
    }

    return main_interaction.followUp({
        embeds: [embed],
        ephemeral: true,
    });
};

module.exports.data = queueConfig;
