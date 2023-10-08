const { EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { unescape } = require('validator');

module.exports = class TicketEmbeds {
    constructor() {}

    defaultEmbedOptions = {
        color: '#00FF00',
        title: 'Support Ticket',
        description: 'Create a support ticket to get help from the staff team.',
        ticket_description:
            'Please describe your issue in as much detail as possible. The staff team will be with you shortly.',
    };

    sendTicketEmbed(newSettings) {
        return new Promise(async (resolve) => {
            const embed = new EmbedBuilder()
                .setTitle(this.defaultEmbedOptions.title)
                .setDescription(
                    unescape(newSettings.description) || this.defaultEmbedOptions.description
                )
                .setColor(this.defaultEmbedOptions.color);

            const btn = await this.generateCreateButton();

            await this.main_interaction.guild.channels.fetch();
            const ticketChannel = this.main_interaction.guild.channels.cache.get(
                newSettings.channel
            );

            if (!ticketChannel) {
                return resolve(false);
            }

            await ticketChannel
                .send({
                    embeds: [embed],
                    components: [new ActionRowBuilder().addComponents(btn)],
                })
                .then((message) => {
                    return resolve(message.url);
                })
                .catch(() => {
                    return resolve(false);
                });
        });
    }

    sendTicketChannelEmbed(channel) {
        return new Promise(async (resolve, reject) => {
            const embed = new EmbedBuilder()
                .setTitle(this.defaultEmbedOptions.title)
                .setDescription(
                    unescape(this.settings.ticket_description) ||
                        this.defaultEmbedOptions.ticket_description
                )
                .setColor(this.defaultEmbedOptions.color);

            this.generateCloseButton();

            await channel
                .send({
                    content: `<@${this.main_interaction.user.id}>`,
                    embeds: [embed],
                    components: [new ActionRowBuilder().addComponents(this.buttons)],
                })
                .then(() => {
                    return resolve(true);
                })
                .catch((err) => {
                    return reject(false);
                });
        });
    }

    clearBtns() {
        this.buttons = [];
    }

    generateCreateButton() {
        return new Promise(async (resolve) => {
            const button = new ButtonBuilder()
                .setStyle(ButtonStyle.Success)
                .setLabel('Create Ticket')
                .setCustomId('create_ticket');

            return resolve(button);
        });
    }

    generateCloseButton() {
        return new Promise(async (resolve) => {
            const button = new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel('Close Ticket')
                .setCustomId('close_ticket');

            this.buttons.push(button);
            return resolve(button);
        });
    }

    generateDeleteButton() {
        return new Promise(async (resolve) => {
            const button = new ButtonBuilder()
                .setStyle(ButtonStyle.Danger)
                .setLabel('Delete Ticket')
                .setCustomId('delete_ticket');

            this.buttons.push(button);
            return resolve(button);
        });
    }

    generateTranscriptButton() {
        return new Promise(async (resolve) => {
            const button = new ButtonBuilder()
                .setStyle(ButtonStyle.Success)
                .setLabel('Save Transcript')
                .setCustomId('save_ticket');

            this.buttons.push(button);
            return resolve(button);
        });
    }

    appendButtons() {
        return new Promise(async (resolve) => {
            const btns = new ActionRowBuilder().addComponents(this.buttons);
            if (btns.components.length > 0) {
                this.main_interaction.message.edit({
                    components: [new ActionRowBuilder().addComponents(this.buttons)],
                });
            } else {
                this.main_interaction.message.edit({
                    components: [],
                });
            }
            return resolve(true);
        });
    }

    deleteEmbed(message_link) {
        return new Promise(async (resolve) => {
            const channelId = message_link.split('/').slice(-2)[0];
            const messageId = message_link.split('/').pop();

            const message = await this.main_interaction.guild.channels.cache
                .get(channelId)
                .messages.fetch(messageId);

            if (message) {
                message.delete().catch((err) => {});
            }

            return resolve(true);
        });
    }
};
