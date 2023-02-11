const { QueryType } = require('discord-player');
const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const Music = require('../../../utils/functions/data/Music');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');

module.exports.run = async ({ main_interaction, bot }) => {
    const musicApi = new Music(main_interaction, bot);

    await main_interaction.deferReply({
        ephemeral: true,
    });

    if (!(await musicApi.isUserInChannel()))
        return main_interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription('You must be in a voice channel to use this command!'),
            ],
            ephemeral: true,
        });

    const queue = await musicApi.createQueue();

    if (await musicApi.isBotMuted()) {
        await main_interaction.followUp({
            embeds: [
                new EmbedBuilder()
                    .setColor('#ff0000')
                    .setDescription("I'm muted, please unmute me to use this command."),
            ],
            ephemeral: true,
        });
        musicApi.pause();
        return;
    }

    const embed = new EmbedBuilder();

    const target = main_interaction.options.getString('target');

    const result = await bot.player.search(target, {
        requestedBy: main_interaction.user,
        searchEngine: QueryType.AUTO,
    });

    if (result.tracks.length === 0)
        return main_interaction.followUp({
            embeds: [
                embed
                    .setColor('#ff0000')
                    .setDescription('No results for this song. Be sure to send a valid link.'),
            ],
        });

    if (result.playlist) {
        await queue.addTracks(result.tracks);
        embed
            .setDescription(
                `**${result.playlist.title}** with ${result.playlist.tracks.length} Songs has been added to the Queue`
            )
            .setURL(result.playlist.url)
            .setThumbnail(result.playlist.thumbnail.url)
            .setColor('#00ff00')
            .setFooter({
                text: `Songs in Queue: ${queue.tracks.length}`,
            });
    } else {
        await queue.addTrack(result.tracks[0]);
        embed
            .setDescription(
                `**[${result.tracks[0].title}](${result.tracks[0].url})** has been added to the Queue`
            )
            .setThumbnail(result.tracks[0].thumbnail)
            .setFooter({
                text: `Duration: ${result.tracks[0].duration}\nSongs in Queue: ${queue.tracks.length}`,
            });
    }

    if (!queue.playing) {
        await queue
            .play()
            .then(async () => {
                await main_interaction.followUp({
                    embeds: [embed],
                });
            })
            .catch((err) => {
                errorhandler({
                    err,
                });

                main_interaction.followUp({
                    content: 'An error occured while playing the song',
                    ephemeral: true,
                });
            });
    } else {
        main_interaction.followUp({
            embeds: [embed],
        });
    }
};

module.exports.data = new SlashCommandBuilder()
    .setName('play')
    .setDescription('Plays a song')
    .addStringOption((option) =>
        option
            .setName('target')
            .setDescription('The Song or playlist you want to play')
            .setRequired(true)
    );
