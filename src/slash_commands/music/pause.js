const { EmbedBuilder } = require('discord.js');
const Music = require('~utils/classes/Music');
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
                    .setDescription(
                        global.t.trans(['error.music.nothingPlays'], main_interaction.guild.id)
                    )
                    .setColor(global.t.trans(['general.colors.error'])),
            ],
            ephemeral: true,
        });

    await musicApi.pause();

    return main_interaction.followUp({
        embeds: [
            new EmbedBuilder()
                .setDescription(global.t.trans(['success.music.pause'], main_interaction.guild.id))
                .setColor(global.t.trans(['general.colors.success'])),
        ],
        ephemeral: true,
    });
};

module.exports.data = pauseConfig;
