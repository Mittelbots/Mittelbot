const {
    EmbedBuilder
} = require('discord.js');
const {
    SlashCommandBuilder
} = require('discord.js');
const Music = require('../../../utils/functions/data/Music');

module.exports.run = async ({
    main_interaction,
    bot
}) => {
    const musicApi = new Music(main_interaction, bot);

    await main_interaction.deferReply({
        ephemeral: true
    });

    if (!await musicApi.isUserInChannel()) return main_interaction.followUp({
        embeds: [
            new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('You must be in a voice channel to use this command!')
        ],
        ephemeral: true
    });

    const queue = bot.player.getQueue(main_interaction.guild);

    if (await musicApi.isBotMuted()) {
        await main_interaction.followUp({
            embeds: [new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription("I'm muted, please unmute me to use this command. I'll leave the channel to safe resources.")
            ],
            ephemeral: true
        })

        await musicApi.pause();
        return;
    }

    if (!queue || queue.paused) return main_interaction.followUp({
        embeds: [
            new EmbedBuilder()
                .setColor('#ff0000')
                .setDescription('There is no song paused right now!')
        ],
        ephemeral: true
    });

    await musicApi.pause();

    return main_interaction.followUp({
        embeds: [new EmbedBuilder()
            .setColor('#00ff00')
            .setDescription('The current song has been resumed.')],
        ephemeral: true
    });

};

module.exports.data = new SlashCommandBuilder()
    .setName('resume')
    .setDescription('Resume the last song.')