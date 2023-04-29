const { SlashCommandBuilder } = require('discord.js');

module.exports.autoDeleteConfig = new SlashCommandBuilder()
    .setName('autodelete')
    .setDescription('Auto delete messages in a channel when they are not allowed')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('get')
            .setDescription('Get the current channel settings')
            .addChannelOption((option) =>
                option
                    .setName('channel')
                    .setDescription('The channel to get the settings from')
                    .setRequired(true)
            )
    )

    .addSubcommand((subcommand) =>
        subcommand
            .setName('set')
            .setDescription('Set the autodelete settings')
            .addChannelOption((option) =>
                option
                    .setName('channel')
                    .setDescription('The channel to set the channel settings')
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('type')
                    .setDescription('The type of the autodelete settings')
                    .setRequired(true)
                    .addChoices(
                        {
                            name: 'isOnlyMedia',
                            value: 'isOnlyMedia',
                        },
                        {
                            name: 'isOnlyText',
                            value: 'isOnlyText',
                        },
                        {
                            name: 'isOnlyEmotes',
                            value: 'isOnlyEmotes',
                        },
                        {
                            name: 'isOnlyStickers',
                            value: 'isOnlyStickers',
                        }
                    )
            )
            .addBooleanOption((option) =>
                option
                    .setName('value')
                    .setDescription('True = active, False = inactive')
                    .setRequired(true)
            )
    );

module.exports.autoDeletePerms = {
    adminOnly: true,
    modOnly: false,
    guildOwnerOnly: false,
    requirePerms: [],
    botOwnerOnly: false,
};
