const { EmbedBuilder, ButtonStyle, ActionRowBuilder, ButtonBuilder } = require('discord.js');
const { errorhandler } = require('../../errorhandler/errorhandler');

module.exports = class TicketEmbeds {
    constructor() {}

    defaultEmbedOptions = {
        color: '#00FF00',
        title: 'Support Ticket',
        description: 'Create a support ticket to get help from the staff team.',
        ticket_description:
            'Please describe your issue in as much detail as possible. The staff team will be with you shortly.',
    };

    sendEmbed() {
        return new Promise(async (resolve, reject) => {
            const embed = new EmbedBuilder()
                .setColor(this.defaultEmbedOptions.color)
                .setTitle(this.defaultEmbedOptions.title)
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
                        .setColor(this.defaultEmbedOptions.color)
                        .setTitle(this.defaultEmbedOptions.title)
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

    sendTicketEmbed(channel) {
        return new Promise(async (resolve, reject) => {
            await channel
                .send({
                    content: `<@${this.main_interaction.user.id}>`,
                    embeds: [
                        new EmbedBuilder()
                            .setColor(this.defaultEmbedOptions.color)
                            .setTitle(this.defaultEmbedOptions.title)
                            .setDescription(this.defaultEmbedOptions.ticket_description)
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
            this.main_interaction.message.edit({
                components: [new ActionRowBuilder().addComponents(this.buttons)],
            });
            return resolve(true);
        });
    }
};
