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

    saveTicket(channel) {
        return new Promise(async (resolve, reject) => {
            await ticketModel
                .create({
                    guild_id: this.main_interaction.guild.id,
                    channel_id: channel.id,
                    owner: this.main_interaction.user.id,
                    source_message_link: this.main_interaction.message.url,
                })
                .then(() => {
                    return resolve(true);
                })
                .catch((err) => {
                    return reject(err.message);
                });
        });
    }

    hasUserAlreadyTicket(source_message_link) {
        return new Promise(async (resolve, reject) => {
            await ticketModel
                .findOne({
                    where: {
                        owner: this.main_interaction.user.id,
                        source_message_link,
                    },
                })
                .then((data) => {
                    if (data) {
                        return resolve(true);
                    }
                    return resolve(false);
                })
                .catch((err) => {
                    return reject(err.message);
                });
        });
    }
};