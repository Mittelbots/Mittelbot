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

    getTicket(search) {
        return new Promise(async (resolve, reject) => {
            await ticketModel
                .findOne({
                    where: search,
                })
                .then((data) => {
                    if (data) {
                        return resolve(data);
                    }
                    return resolve(false);
                })
                .catch((err) => {
                    return reject(err.message);
                });
        });
    }

    isWritingInTicketChannel(user_id, channel_id) {
        return new Promise(async (resolve, reject) => {
            await this.getTicket({
                owner: user_id,
                channel_id,
            })
                .then((data) => {
                    if (data) {
                        return resolve(true);
                    }
                    return resolve(false);
                })
                .catch((err) => {
                    return resolve(false);
                });
        });
    }

    saveMessage(message) {
        return new Promise(async (resolve, reject) => {
            const ticket = await this.getTicket({
                channel_id: message.channel.id,
            })
                .then((data) => {
                    return data;
                })
                .catch((err) => {
                    return reject(err);
                });

            const newMessageObj = {
                message_id: message.id,
                message_content: message.content,
                message_author: message.author.id,
                message_author_tag: message.author.tag,
                message_author_avatar: message.author.displayAvatarURL(),
                message_timestamp: message.createdTimestamp,
            };

            ticket.messages.push(newMessageObj);

            await ticketModel
                .update(
                    {
                        messages: ticket.messages,
                    },
                    {
                        where: {
                            id: ticket.id,
                        },
                    }
                )
                .then(() => {
                    return resolve(true);
                })
                .catch((err) => {
                    return reject(err.message);
                });
        });
    }
};
