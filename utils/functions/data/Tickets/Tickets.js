const classes = require('extends-classes');

const { ChannelType, PermissionFlagsBits } = require('discord.js');
const { errorhandler } = require('../../errorhandler/errorhandler');
const ticketModel = require('../../../../src/db/Models/tables/tickets.model');
const TicketSettings = require('./TicketsSettings');
const TicketInteraction = require('./TicketInteraction');
const TicketEmbeds = require('./TicketEmbeds');
const TicketChannel = require('./TicketChannel');

module.exports = class Tickets extends (
    classes(TicketSettings, TicketInteraction, TicketEmbeds, TicketChannel)
) {
    buttons = [];

    constructor(bot, main_interaction) {
        super(bot, main_interaction);
        this.bot = bot;
        this.main_interaction = main_interaction;
    }
};
