const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const Music = require('../../../utils/functions/data/Music');

module.exports.run = async ({ main_interaction, bot }) => {
    const musicApi = new Music(main_interaction, bot);

    await main_interaction.deferReply({
        ephemeral: true,
    });

    if (!(await musicApi.isUserInChannel()) || !(await musicApi.isBotWithUserInChannel()))
        return main_interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('You must be in a voice channel to use this command!'),
            ],
            ephemeral: true,
        });

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

module.exports.data = new SlashCommandBuilder()
    .setName('disconnect')
    .setDescription('Disconnect the bot from the voice channel.');
