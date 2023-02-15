const { EmbedBuilder } = require('discord.js');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');

module.exports.registerPlayerEvents = (player) => {
    player.on('error', (queue, error) => {
        errorhandler({
            err: error,
            message: `Error emitted from the queue ${queue.guild.name} | ${error.message}`,
        });
        queue.metadata.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Error')
                    .setDescription(
                        `Error emitted from the queue ${queue.guild.name} | ${error.message}`
                    )
                    .setColor('#bb0000')
                    .setTimestamp(),
            ],
        });
    });

    player.on('connectionError', (queue, error) => {
        errorhandler({
            err: error,
            message: `Error emitted from the connection ${queue.guild.name} | ${error.message}`,
        });
        queue.metadata.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Error')
                    .setDescription(
                        `Error emitted from the connection ${queue.guild.name} | ${error.message}`
                    )
                    .setColor('#bb0000')
                    .setTimestamp(),
            ],
        });
    });

    player.on('trackStart', (queue, track) => {
        queue.metadata.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Now playing')
                    .setDescription(`Now playing ${track.title}...`)
                    .setColor('#38ff46')
                    .setImage(track.thumbnail.url)
                    .setTimestamp(),
            ],
        });
    });

    player.on('trackAdd', (queue, track) => {
        queue.metadata.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Now playing')
                    .setDescription(`Track ${track.title} added to the queue!`)
                    .setColor('#38ff46')
                    .setImage(track.thumbnail.url)
                    .setTimestamp(),
            ],
        });
    });

    player.on('botDisconnect', (queue) => {
        queue.metadata.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Now playing')
                    .setDescription(
                        `I was manually disconnected from the voice channel, clearing queue!`
                    )
                    .setColor('#ff6e12')
                    .setTimestamp(),
            ],
        });
    });

    player.on('channelEmpty', (queue) => {
        queue.metadata.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Now playing')
                    .setDescription(`Nobody is in the voice channel, leaving the channel!`)
                    .setColor('#ff6e12')
                    .setTimestamp(),
            ],
        });
    });

    player.on('queueEnd', (queue) => {
        queue.metadata.channel.send({
            embeds: [
                new EmbedBuilder()
                    .setTitle('Now playing')
                    .setDescription(`Queue has ended!`)
                    .setColor('#ff6e12')
                    .setTimestamp(),
            ],
        });
    });
};
