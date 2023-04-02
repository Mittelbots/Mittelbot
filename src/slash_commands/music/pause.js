const { EmbedBuilder } = require('discord.js');
const Music = require('../../../utils/functions/data/Music');
const { pauseConfig } = require('../_config/music/pause');

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

    if (!(await musicApi.isPlaying()))
        return main_interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('There is no song playing right now!'),
            ],
            ephemeral: true,
        });

    await musicApi.pause();

    return main_interaction.followUp({
        embeds: [
            new EmbedBuilder()
                .setColor('#00ff00')
                .setDescription('The current song has been paused.'),
        ],
        ephemeral: true,
    });
};

module.exports.data = pauseConfig;
