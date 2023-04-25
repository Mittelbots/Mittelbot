const { EmbedBuilder } = require('discord.js');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const Music = require('../../../utils/functions/data/Music');

module.exports.registerPlayerEvents = (player, bot) => {
    player.events.on('error', (queue, error) => {
        errorhandler({
            err: error,
            message: `Error emitted from the queue ${queue.guild.name} | ${error.message}`,
            fatal: false,
        });
        queue.metadata.channel
            .send({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `Error emitted from the queue ${queue.guild.name} | ${error.message}`
                        )
                        .setColor('#bb0000')
                        .setTimestamp(),
                ],
            })
            .catch(() => {
                // No permissions
            });

        new Music(null, bot, true).destroy(queue.guild.id);
    });

    player.events.on('playerError', (queue, error) => {
        errorhandler({
            err: error,
            message: `Error emitted from the connection ${queue.guild.name} | ${error.message}`,
        });
        queue.metadata.channel
            .send({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `Error emitted from the connection ${queue.guild.name} | ${error.message}`
                        )
                        .setColor('#bb0000')
                        .setTimestamp(),
                ],
            })
            .catch(() => {
                // No permissions
            });
    });

    player.events.on('playerStart', (queue, track) => {
        queue.metadata.channel
            .send({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`Now playing ${track.title}...`)
                        .addFields({
                            name: 'Requested by',
                            value: track.requestedBy
                                ? track.requestedBy.username || 'Unknown'
                                : 'Unknown',
                        })
                        .setColor('#38ff46')
                        .setThumbnail(track.thumbnail)
                        .setTimestamp(),
                ],
            })
            .catch(() => {
                // No permissions
            });
    });

    player.events.on('audioTrackAdd', (queue, track) => {
        queue.metadata.channel
            .send({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`Track ${track} added to the queue!`)
                        .addFields({
                            name: 'Requested by',
                            value: track.requestedBy
                                ? track.requestedBy.username || 'Unknown'
                                : 'Unknown',
                        })
                        .setColor('#38ff46')
                        .setThumbnail(track.thumbnail)
                        .setTimestamp(),
                ],
            })
            .catch(() => {
                // No permissions
            });
    });

    player.events.on('disconnect', (queue) => {
        queue.metadata.channel
            .send({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            `I was manually disconnected or left due inactivity from the voice channel, clearing queue!`
                        )
                        .setColor('#ff6e12')
                        .setTimestamp(),
                ],
            })
            .catch(() => {
                // No permissions
            });

        new Music(null, bot, true).destroy(queue.guild.id);
    });

    player.events.on('emptyChannel', (queue) => {
        queue.metadata.channel
            .send({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`Nobody is in the voice channel, leaving the channel!`)
                        .setColor('#ff6e12')
                        .setTimestamp(),
                ],
            })
            .catch(() => {
                // No permissions
            });

        new Music(null, bot, true).destroy(queue.guild.id);
    });

    player.events.on('emptyQueue', (queue) => {
        queue.metadata.channel
            .send({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(`Queue has ended!`)
                        .setColor('#ff6e12')
                        .setTimestamp(),
                ],
            })
            .catch(() => {
                // No permissions
            });

        new Music(null, bot, true).destroy(queue.guild.id);
    });
};
