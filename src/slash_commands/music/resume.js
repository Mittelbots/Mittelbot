const { EmbedBuilder } = require('discord.js');
const Music = require('~utils/classes/Music');
const { resumeData } = require('../_config/music/resume');

module.exports.run = async ({ main_interaction, bot }) => {
    const musicApi = new Music(main_interaction, bot);

    await main_interaction.deferReply({
        ephemeral: true,
    });

    const isNotAvailable = await musicApi.checkAvailibility();
    if (isNotAvailable) {
        return main_interaction.followUp({
            embeds: [new EmbedBuilder().setColor('#ff0000').setDescription(isNotAvailable)],
            ephemeral: true,
        });
    }

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
            .catch(() => {});

        await musicApi.pause();
        return;
    }

    if (!musicApi.isPaused()) {
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
            .catch(() => {});
    }

    await musicApi.resume();

    return await main_interaction.followUp({
        embeds: [
            new EmbedBuilder()
                .setDescription(
                    global.t.trans(['success.music.resume.resumed'], main_interaction.guild.id)
                )
                .setColor(global.t.trans(['general.colors.success'])),
        ],
        ephemeral: true,
    });
};

module.exports.data = resumeData;
