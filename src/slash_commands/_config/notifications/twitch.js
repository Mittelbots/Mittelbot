const { SlashCommandBuilder } = require('discord.js');

module.exports.twitchConfig = new SlashCommandBuilder()
    .setName('twitch')
    .setDescription(
        'Add up to 3 twitch channels to get a notification when a new video is uploaded.'
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('add')
            .setDescription('Add a twitch channel to the list.')
            .addStringOption((ytchannel) =>
                ytchannel
                    .setName('twitchchannel')
                    .setDescription('Add the twitch channel name.')
                    .setRequired(true)
            )
            .addChannelOption((dcchannel) =>
                dcchannel
                    .setName('dcchannel')
                    .setDescription(
                        'Select a text channel where the notification will be send it when the streamer is live.'
                    )
                    .setRequired(true)
            )
            .addRoleOption((warnrole) =>
                warnrole
                    .setName('twitchping')
                    .setDescription(
                        'Add a ping role to be pinged each time a the streamer is live.'
                    )
                    .setRequired(false)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('remove')
            .setDescription('Remove a twitch channel from the list.')
            .addStringOption((ytchannel) =>
                ytchannel
                    .setName('twitchchannel')
                    .setDescription('Add the twitch channel name.')
                    .setRequired(true)
            )
    );
