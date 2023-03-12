const { EmbedBuilder, ButtonStyle, ChannelType, PermissionFlagsBits } = require('discord.js');
const { errorhandler } = require('../errorhandler/errorhandler');
const { GuildConfig } = require('./Config');
const { ButtonBuilder } = require('discord.js');
const { ActionRowBuilder } = require('discord.js');
const ticketModel = require('../../../src/db/Models/tables/tickets.model');

module.exports = class Tickets {
    constructor(bot, main_interaction) {
        this.bot = bot;
        this.main_interaction = main_interaction;
    }

    static defaultEmbedOptions = {
        color: '#00FF00',
        title: 'Support Ticket',
        description: 'Create a support ticket to get help from the staff team.',
        ticket_description:
            'Please describe your issue in as much detail as possible. The staff team will be with you shortly.',
    };

    init(settings) {
        this.settings = settings;
    }

    getSettings() {
        return {
            channel: this.settings.channel,
            description: this.settings.description || Tickets.defaultEmbedOptions.description,
            category: this.settings.category,
            close_category: this.settings.close_category,
            moderator: this.settings.moderator,
            ticket_description:
                this.settings.ticket_description || Tickets.defaultEmbedOptions.ticket_description,
            message_link: this.settings.message_link,
        };
    }

    createSetting(message_link) {
        return new Promise(async (resolve, reject) => {
            const config = await this.get().catch((err) => {
                errorhandler({ err });
                return reject(false);
            });
            if (!config) {
                return reject(false);
            }

            this.settings.message_link = message_link;
            config.push(this.getSettings());

            await GuildConfig.update({
                guild_id: this.main_interaction.guild.id,
                value: config,
                valueName: 'tickets',
            })
                .then(() => {
                    return resolve(true);
                })
                .catch((err) => {
                    errorhandler({ err });
                    return reject(false);
                });
        });
    }

    update() {
        return new Promise(async (resolve, reject) => {
            const config = await this.get().catch((err) => {
                errorhandler({ err });
                return reject(false);
            });

            if (!config) {
                return reject(false);
            }

            const index = config.findIndex((x) => x.message_link == this.settings.message_link);

            if (index == -1) {
                return reject(false);
            }

            config[index] = this.getSettings();

            await GuildConfig.update({
                guild_id: this.main_interaction.guild.id,
                value: config,
                valueName: 'tickets',
            })
                .then(() => {
                    this.updateEmbed();
                    return resolve(true);
                })
                .catch((err) => {
                    errorhandler({ err });
                    return reject(false);
                });
        });
    }

    delete() {
        return new Promise(async (resolve, reject) => {
            const config = await this.get().catch((err) => {
                errorhandler({ err });
                return reject(false);
            });

            if (!config) {
                return reject(false);
            }

            const index = config.findIndex((x) => x.message_link == this.settings.message_link);

            if (index == -1) {
                return reject(false);
            }

            config.splice(index, 1);

            await GuildConfig.update({
                guild_id: this.main_interaction.guild.id,
                value: config,
                valueName: 'tickets',
            })
                .then(() => {
                    this.deleteEmbed();
                    return resolve(true);
                })
                .catch((err) => {
                    errorhandler({ err });
                    return reject(false);
                });
        });
    }

    get() {
        return new Promise(async (resolve, reject) => {
            await GuildConfig.get(this.main_interaction.guild.id)
                .then((config) => {
                    if (!config) return resolve([]);
                    return resolve(config.tickets || []);
                })
                .catch((err) => {
                    errorhandler({ err });
                    return reject(false);
                });
        });
    }

    sendEmbed() {
        return new Promise(async (resolve, reject) => {
            const embed = new EmbedBuilder()
                .setColor(Tickets.defaultEmbedOptions.color)
                .setTitle(Tickets.defaultEmbedOptions.title)
                .setDescription(this.settings.description);

            await this.settings.channel
                .send({
                    embeds: [embed],
                    components: [new ActionRowBuilder().addComponents(await this.generateButton())],
                })
                .then(async (message) => {
                    return resolve(message.url);
                })
                .catch((err) => {
                    errorhandler({ err });
                    return reject(false);
                });
        });
    }

    updateEmbed() {
        return new Promise(async (resolve, reject) => {
            const message_link = this.settings.message_link;
            const channel = message_link.split('/')[5];
            const message = message_link.split('/')[6];

            await this.main_interaction.guild.channels.cache
                .get(channel)
                .messages.fetch(message)
                .then(async (message) => {
                    const embed = new EmbedBuilder()
                        .setColor(Tickets.defaultEmbedOptions.color)
                        .setTitle(Tickets.defaultEmbedOptions.title)
                        .setDescription(this.settings.description);

                    await message.edit({ embeds: [embed] });
                    return resolve(true);
                })
                .catch((err) => {
                    errorhandler({ err });
                    return reject(false);
                });
        });
    }

    deleteEmbed() {
        return new Promise(async (resolve, reject) => {
            const message_link = this.settings.message_link;
            const channel = message_link.split('/')[5];
            const message = message_link.split('/')[6];

            await this.main_interaction.guild.channels.cache
                .get(channel)
                .messages.fetch(message)
                .then(async (message) => {
                    await message.delete();
                    return resolve(true);
                })
                .catch((err) => {
                    errorhandler({ err });
                    return reject(false);
                });
        });
    }

    generateButton() {
        return new Promise(async (resolve) => {
            const button = new ButtonBuilder()
                .setStyle(ButtonStyle.Success)
                .setLabel('Create Ticket')
                .setCustomId('create_ticket');

            return resolve(button);
        });
    }

    interacte() {
        return new Promise(async (resolve, reject) => {
            const config = await this.get().catch((err) => {
                errorhandler({ err });
                return reject(false);
            });

            if (!config) {
                return reject(false);
            }

            const index = config.findIndex(
                (x) => x.message_link == this.main_interaction.message.url
            );

            if (index == -1) {
                return reject(false);
            }

            this.settings = config[index];

            try {
                if (this.main_interaction.customId == 'create_ticket') {
                    Promise.resolve([this.createTicket()]);
                } else if (this.main_interaction.customId == 'close_ticket') {
                    Promise.resolve([this.closeTicket()]);
                }
            } catch (err) {
                await this.main_interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#FF0000')
                            .setTitle('Error')
                            .setDescription('Something went wrong while creating the ticket.'),
                    ],
                });
            }

            return resolve(true);
        });
    }

    createTicket() {
        return new Promise(async (resolve, reject) => {
            const channel = await this.createTicketChannel();
            if (!channel) return reject(false);
            await this.sendTicketEmbed(channel);

            await ticketModel.create({
                guild_id: this.main_interaction.guild.id,
                channel_id: this.settings.channel.id,
                message_link: this.main_interaction.message.url,
                ticket_owner: this.main_interaction.user.id,
            });

            return resolve(true);
        });
    }

    closeTicket() {
        return new Promise(async (resolve, reject) => {
            const channel = await this.main_interaction.guild.channels.cache.get(
                this.main_interaction.channel.id
            );
            if (!channel) return reject(false);
            channel.update({
                permissionOverwrites: [
                    {
                        id: this.main_interaction.guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                ],
            });

            resolve(true);
        });
    }

    createTicketChannel() {
        return new Promise(async (resolve, reject) => {
            this.bot.guilds.cache
                .get(this.main_interaction.guild.id)
                .channels.create({
                    name: `ticket-${this.main_interaction.user.username}`,
                    type: ChannelType.GuildText,
                    parent: this.settings.category || null,
                    permissionOverwrites: [
                        {
                            id: this.main_interaction.guild.id,
                            deny: [PermissionFlagsBits.ViewChannel],
                        },
                        {
                            id: this.main_interaction.user.id,
                            allow: [PermissionFlagsBits.ViewChannel],
                        },
                    ],
                })
                .then((channel) => {
                    return resolve(channel);
                })
                .catch((err) => {
                    errorhandler({ err });
                    return reject(false);
                });
        });
    }

    sendTicketEmbed(channel) {
        return new Promise(async (resolve, reject) => {
            await channel
                .send({
                    content: `<@${this.main_interaction.user.id}>`,
                    embeds: [
                        new EmbedBuilder()
                            .setColor(Tickets.defaultEmbedOptions.color)
                            .setTitle(Tickets.defaultEmbedOptions.title)
                            .setDescription(Tickets.defaultEmbedOptions.ticket_description)
                            .setFooter({
                                text: `Ticket Owner: ${this.main_interaction.user.username}`,
                                iconURL: this.main_interaction.user.avatarURL(),
                            }),
                    ],
                    components: [
                        new ActionRowBuilder().addComponents(await this.generateCloseButton()),
                    ],
                })
                .then(async (message) => {
                    return resolve(message);
                })
                .catch((err) => {
                    errorhandler({ err });
                    return reject(false);
                });
        });
    }

    generateCloseButton() {
        return new Promise(async (resolve) => {
            const button = new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel('Close Ticket')
                .setCustomId('close_ticket');

            return resolve(button);
        });
    }
};
