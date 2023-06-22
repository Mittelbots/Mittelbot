const classes = require('extends-classes');

const ticketModel = require('~src/db/Models/tickets.model');
const TicketSettings = require('./TicketsSettings');
const TicketInteraction = require('./TicketInteraction');
const TicketEmbeds = require('./TicketEmbeds');
const TicketChannel = require('./TicketChannel');
const TicketTransscript = require('./TicketTransscript');
const { hasPermission } = require('~utils/functions/hasPermissions');

module.exports = class Tickets extends (
    classes(TicketSettings, TicketInteraction, TicketEmbeds, TicketChannel, TicketTransscript)
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
                        isOpen: true,
                        isDeleted: false,
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

    closeTicket(channel_id) {
        return new Promise(async (resolve, reject) => {
            await ticketModel
                .update(
                    {
                        isOpen: false,
                        closed_by: this.main_interaction.user.id,
                    },
                    {
                        where: {
                            channel_id: this.main_interaction.channel.id,
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

    deleteTicket(channel_id) {
        return new Promise(async (resolve, reject) => {
            await ticketModel
                .update(
                    {
                        isDeleted: true,
                    },
                    {
                        where: {
                            channel_id: this.main_interaction.channel.id,
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

    isTicketModerator() {
        return new Promise(async (resolve, reject) => {
            await this.getSettingsWithChannel(this.main_interaction.channel.id);
            if (!this.settings) return reject(false);

            let isTicketModerator = false;

            if (this.settings.moderator) {
                const userRoles = this.main_interaction.member.roles.cache.map((r) => r.id);
                const moderatorRoles = this.settings.moderator;
                const hasTicketModRole = userRoles.some((r) => moderatorRoles.includes(r));
                isTicketModerator = hasTicketModRole;
            }

            if (!isTicketModerator) {
                isTicketModerator = await hasPermission({
                    guild_id: this.main_interaction.guild.id,
                    adminOnly: false,
                    modOnly: false,
                    user: this.main_interaction.user,
                    bot: this.bot,
                });
            }

            return resolve(isTicketModerator);
        });
    }
};
