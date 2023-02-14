const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const Music = require('../../../utils/functions/data/Music');

module.exports.run = async ({ main_interaction, bot }) => {
    const musicApi = new Music(main_interaction, bot);

    await main_interaction.deferReply({
        ephemeral: true,
    });

    if (!(await musicApi.isUserInChannel()) && (await musicApi.isBotWithUserInChannel()))
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

    await main_interaction.followUp({
        embeds: [
            new EmbedBuilder()
                .setColor('#00ff00')
                .setDescription('The song has stopped and the queue is cleared. See you 👋'),
        ],
        ephemeral: true,
    });

    return await queue.destroy();
};

module.exports.data = new SlashCommandBuilder()
    .setName('stop')
    .setDescription('Stop the current song and clear the queue.');