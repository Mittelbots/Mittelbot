const { SlashCommandBuilder } = require('discord.js');
const Tickets = require('../../../utils/functions/data/Tickets');

module.exports.run = async ({ main_interaction, bot }) => {

    const subcommand = main_interaction.options.getSubcommand();

    const channel = main_interaction.options.getChannel('channel');
    const description = main_interaction.options.getString('description');
    const category = main_interaction.options.getChannel('category');
    const close_category = main_interaction.options.getChannel('close_category');
    const moderator = main_interaction.options.getString('moderator');
    const ticket_description = main_interaction.options.getString('ticket_description');
    const message_link = main_interaction.options.getString('message_link');
    
    if(subcommand === 'create') {
        const tickets = new Tickets(bot, main_interaction);
        tickets.init({
            channel,
            description,
            category,
            close_category,
            moderator,
            ticket_description,
        });
        const message_link = await tickets.sendEmbed();
        tickets.create(message_link);
    }else if(subcommand === 'update') {

    }else {
       
    }

};

module.exports.data = new SlashCommandBuilder()
    .setName('tickets')
    .setDescription('Create a ticket system for your server.')
    .addSubcommand(subcommand =>
        subcommand
            .setName('create')
            .setDescription('Create a ticket system for your server.')
            .addChannelOption(option =>
                option
                    .setName('channel')
                    .setDescription('The channel to create the ticket system in.')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName('description')
                    .setDescription('Set the description for the ticket embed.')
                    .setRequired(true)
            )
            .addChannelOption(option => 
                option
                    .setName('category')
                    .setDescription('Set the category for the ticket channels.')
            )
            .addChannelOption(option =>
                option
                    .setName('close_category')
                    .setDescription('Set the category for all closed ticket channels.')
            )
            .addStringOption(option =>
                option
                    .setName('moderator')
                    .setDescription('Set all the roles that can moderate tickets. If not set, the default moderator role will be used.')
            )
            .addStringOption(option =>
                option
                    .setName('ticket_description')
                    .setDescription('Set the description for embed inside the ticket.')
            )


    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('update')
            .setDescription('Edit your ticket settings.')
            .addStringOption(option =>
                option
                    .setName('message_link')
                    .setDescription('The message link to the ticket embed.')
                    .setRequired(true)
            )
            .addStringOption(option =>
                option
                    .setName('description')
                    .setDescription('Set the description for the ticket embed.')
                    .setRequired(true)
            )
            .addChannelOption(option => 
                option
                    .setName('category')
                    .setDescription('Set the category for the ticket channels.')
            )
            .addChannelOption(option =>
                option
                    .setName('close_category')
                    .setDescription('Set the category for all closed ticket channels.')
            )
            .addStringOption(option =>
                option
                    .setName('moderator')
                    .setDescription('Set all the roles that can moderate tickets. If not set, the default moderator role will be used.')
            )
            .addStringOption(option =>
                option
                    .setName('ticket_description')
                    .setDescription('Set the description for embed inside the ticket.')
            )
    )
    .addSubcommand(subcommand =>
        subcommand
            .setName('delete')
            .setDescription('Delete your ticket settings.')
            .addStringOption(option =>
                option
                    .setName('message_link')
                    .setDescription('The message link to the ticket embed.')
                    .setRequired(true)
            )
    )

