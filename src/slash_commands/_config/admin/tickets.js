const { SlashCommandBuilder } = require('discord.js');

module.exports.ticketConfig = new SlashCommandBuilder()
    .setName('tickets')
    .setDescription('Create a ticket system for your server.')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('create')
            .setDescription('Create a ticket system for your server.')
            .addChannelOption((option) =>
                option
                    .setName('channel')
                    .setDescription('The channel to create the ticket system in.')
                    .setRequired(true)
            )
            .addChannelOption((option) =>
                option
                    .setName('log_channel')
                    .setDescription('The place where all saved Transcripts will be sent to.')
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('description')
                    .setDescription('Set the description for the ticket embed.')
            )
            .addChannelOption((option) =>
                option
                    .setName('category')
                    .setDescription('Set the category for the ticket channels.')
            )
            .addChannelOption((option) =>
                option
                    .setName('close_category')
                    .setDescription('Set the category for all closed ticket channels.')
            )
            .addStringOption((option) =>
                option
                    .setName('moderator')
                    .setDescription(
                        'Set all the roles that can moderate tickets. If not set, the default moderator roles will be used.'
                    )
            )
            .addStringOption((option) =>
                option
                    .setName('ticket_description')
                    .setDescription('Set the description for embed inside the ticket.')
            )
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('remove')
            .setDescription('Remove the ticket system from your server.')
            .addStringOption((option) =>
                option
                    .setName('message_link')
                    .setDescription('The message link of the ticket system you want to remove.')
                    .setRequired(true)
            )
    );

module.exports.ticketPerms = {
    adminOnly: true,
    modOnly: false,
    guildOwnerOnly: false,
    requirePerms: [],
    botOwnerOnly: false,
};
