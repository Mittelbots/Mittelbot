const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const Music = require('../../../utils/functions/data/Music');
const { disconnectConfig } = require('../_config/music/disconnect');

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

    await musicApi.disconnect();

    return await main_interaction.followUp({
        embeds: [
            new EmbedBuilder()
                .setColor('#00ff00')
                .setDescription('Disconnected from the voice channel.'),
        ],
        ephemeral: true,
    });
};

module.exports.data = disconnectConfig;
