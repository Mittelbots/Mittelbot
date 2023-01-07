const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const AutoBlacklist = require('../../../utils/functions/data/AutoBlacklist');

module.exports.run = async ({ main_interaction, bot }) => {
    const type = main_interaction.options.getSubcommand();

    switch (type) {
        case 'info':
            const embed = new EmbedBuilder()
                .setTitle('Auto-Blacklist')
                .setDescription(
                    'Auto-Blacklist is a feature that allows you to automatically ban users that are send to a public blacklist.'
                )
                .addFields(
                    {
                        name: 'How to set up Auto-Blacklist?',
                        value: 'To set up Auto-Blacklist, you need to create a announcement channel, add a blacklist webhook and set it up with the command `/autoblacklist set <channel> [ban_message]`',
                    },
                    {
                        name: 'How to use Auto-Blacklist?',
                        value: "You don't need to do anything. If a message is send through the webhook, all user ids in the message will be banned.",
                    },
                    {
                        name: 'How to delete Auto-Blacklist?',
                        value: 'To delete Auto-Blacklist, you need to use the command `/autoblacklist delete`',
                    },
                    {
                        name: '**IMPORTANT**',
                        value: '**Due a bug in Discord.js, every message will be detected. Not only the ones send through the webhook.**',
                    }
                )
                .setImage('https://i.ibb.co/grCfwRw/autoblackllist-example.gif')
                .setTimestamp();
            main_interaction.reply({
                embeds: [embed],
                ephemeral: true,
            });
            break;
        case 'set':
            const channel = main_interaction.options.getChannel('channel');
            const ban_message = main_interaction.options.getString('ban_message');

            const autoBlacklist = new AutoBlacklist();

            const settings = await autoBlacklist.get(main_interaction.guild.id);
            if (settings)
                return main_interaction.reply({
                    content: 'Auto-Blacklist is already set up for this server! Delete it first.',
                    ephemeral: true,
                });

            autoBlacklist
                .set({
                    guild_id: main_interaction.guild.id,
                    channel: channel.id,
                    message: ban_message,
                })
                .then(() => {
                    main_interaction.reply({
                        content: 'Auto-Blacklist has been set up for this server!',
                        ephemeral: true,
                    });
                })
                .catch((err) => {
                    main_interaction.reply({
                        content:
                            'An error occured while setting up Auto-Blacklist for this server!',
                        ephemeral: true,
                    });
                });
            break;

        case 'delete':
            const autoBlacklist2 = new AutoBlacklist();

            const settings2 = await autoBlacklist2.get(main_interaction.guild.id);
            if (!settings2)
                return main_interaction.reply({
                    content: 'Auto-Blacklist is not set up for this server!',
                    ephemeral: true,
                });

            autoBlacklist2
                .delete(main_interaction.guild.id)
                .then(() => {
                    main_interaction.reply({
                        content: 'Auto-Blacklist has been deleted for this server!',
                        ephemeral: true,
                    });
                })
                .catch((err) => {
                    main_interaction.reply({
                        content: 'An error occured while deleting Auto-Blacklist for this server!',
                        ephemeral: true,
                    });
                });
            break;
    }
};

module.exports.data = new SlashCommandBuilder()
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
