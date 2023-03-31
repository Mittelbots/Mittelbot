const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const Music = require('../../../utils/functions/data/Music');
const { resumeData } = require('../_config/music/resume');

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

    if (await musicApi.isBotMuted()) {
        await main_interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription(
                        "I'm muted, please unmute me to use this command. I'll leave the channel to safe resources."
                    ),
            ],
            ephemeral: true,
        });

        await musicApi.pause();
        return;
    }

    if (!musicApi.isPaused())
        return main_interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('There is no song paused right now!'),
            ],
            ephemeral: true,
        });

    await musicApi.resume();

    return main_interaction.followUp({
        embeds: [
            new EmbedBuilder()
                .setColor('#00ff00')
                .setDescription('The current song has been resumed.'),
        ],
        ephemeral: true,
    });
};

module.exports.data = resumeData;
