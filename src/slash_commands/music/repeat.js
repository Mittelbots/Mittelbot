const { EmbedBuilder } = require('discord.js');
const Music = require('~utils/classes/Music');
const { shuffleConfig } = require('../_config/music/shuffle');
const { repeatConfig } = require('../_config/music/repeat');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

    const enable = await main_interaction.options.getBoolean('enable');

    const musicApi = new Music(main_interaction, bot);

    const isNotAvailable = await musicApi.checkAvailibility();
    if (isNotAvailable) {
        return main_interaction.followUp({
            embeds: [new EmbedBuilder().setColor('#ff0000').setDescription(isNotAvailable)],
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
            .catch(() => {});
    }

    await musicApi.repeat(enable);

    return main_interaction.followUp({
        embeds: [
            new EmbedBuilder().setDescription(
                global.t.trans(
                    [enable ? 'success.music.repeat.enable' : 'success.music.repeat.disable'],
                    main_interaction.guild.id
                )
            ),
        ],
    });
};

module.exports.data = repeatConfig;
