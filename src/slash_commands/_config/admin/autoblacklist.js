const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports.autoBlacklistConfig = new SlashCommandBuilder()
    .setName('autoblacklist')
    .setDescription('Set up auto-blacklist for your server')
    .addSubcommand((subcommand) =>
        subcommand.setName('info').setDescription('Get informations about auto-blacklist')
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('set')
            .setDescription('Set up auto-blacklist for your server')
            .addChannelOption((option) =>
                option
                    .setName('channel')
                    .setDescription(
                        'Set the blacklist channel that will get monitored [Webhook channel required]'
                    )
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('ban_message')
                    .setDescription('Set a custom ban message. (Default: "Banned by Blacklist.")')
                    .setRequired(false)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('delete')
            .setDescription('Delete auto-blacklist settings for your server')
    );

module.exports.autoBlacklistPerms = {
    adminOnly: true,
    modOnly: false,
    guildOwnerOnly: false,
    requirePerms: [],
    botOwnerOnly: false,
};
