const { SlashCommandBuilder } = require('discord.js');

module.exports.youtubeConfig = new SlashCommandBuilder()
    .setName('youtube')
    .setDescription('Setup the youtube notifier')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('add')
            .setDescription('Add a youtube channel to follow')
            .addStringOption((option) =>
                option
                    .setName('ytchannel')
                    .setDescription(
                        'Insert here your youtube name. Example: Mittelblut9 (without @)'
                    )
                    .setRequired(true)
            )
            .addChannelOption((option) =>
                option
                    .setName('dcchannel')
                    .setDescription('The discord channel to send the notifications to')
                    .setRequired(true)
            )
            .addRoleOption((option) =>
                option
                    .setName('ytping')
                    .setDescription('The role to ping when a new video is uploaded')
                    .setRequired(false)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('remove')
            .setDescription('Remove the youtube channel from the notification list.')
            .addStringOption((option) =>
                option
                    .setName('ytchannel')
                    .setDescription(
                        'Insert here your youtube name. Example: Mittelblut9 (without @)'
                    )
                    .setRequired(true)
            )
    );

module.exports.youtubePerms = {
    adminOnly: true,
    modOnly: false,
    guildOwnerOnly: false,
    requirePerms: [],
    botOwnerOnly: false,
};
