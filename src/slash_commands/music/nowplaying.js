const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const Music = require('../../../utils/functions/data/Music');
const { nowplayingConfig } = require('../_config/music/nowplaying');

module.exports.run = async ({ main_interaction, bot }) => {
    const musicApi = new Music(main_interaction, bot);

    await main_interaction.deferReply({
        ephemeral: true,
    });

    const queue = await musicApi.getQueue();

    if (await !musicApi.isPlaying())
        return main_interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        global.t.trans(['error.music.nothingPlays'], main_interaction.guild.id)
                    )
                    .setColor(global.t.trans(['general.colors.error'])),
            ],
            ephemeral: true,
        });

    return await main_interaction.followUp({
        embeds: [
            new EmbedBuilder()
                .setDescription(
                    global.t.trans(
                        [
                            'success.music.nowplaying',
                            queue.currentTrack,
                            queue.currentTrack.requestedBy,
                            queue.currentTrack.duration,
                            queue.currentTrack.url,
                        ],
                        main_interaction.guild.id
                    )
                )
                .setColor(global.t.trans(['general.colors.success']))
                .setThumbnail(queue.currentTrack.thumbnail),
        ],
        ephemeral: true,
    });
};

module.exports.data = nowplayingConfig;
