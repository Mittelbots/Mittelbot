const { EmbedBuilder, ButtonStyle } = require("discord.js");
const { errorhandler } = require("../errorhandler/errorhandler");
const { GuildConfig } = require("./Config");
const { ButtonBuilder } = require("discord.js");
const { ActionRowBuilder } = require("discord.js");

module.exports = class Tickets {
    constructor(bot, main_interaction) {
        this.bot = bot;
        this.main_interaction = main_interaction;
    }

    static defaultEmbedOptions = {
        color: '#00FF00',
        title: 'Support Ticket',
        description: 'Create a support ticket to get help from the staff team.',
        ticket_description: 'Please describe your issue in as much detail as possible. The staff team will be with you shortly.',
    }

    init(settings) {
        this.settings = settings;
    }

    getSettings() {
        return {
            channel: this.settings.channel,
            description: this.settings.description || this.defaultEmbedOptions.description,
            category: this.settings.category,
            close_category: this.settings.close_category,
            moderator: this.settings.moderator,
            ticket_description: this.settings.ticket_description || this.defaultEmbedOptions.ticket_description,
            message_link: this.settings.message_link,
        }
    }

    create(message_link) {
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
            }).then(() => {
                return resolve(true);
            }).catch((err) => {
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

            const index = config.findIndex((x) => x.message_link == this.message_link);

            if (index == -1) {
                return reject(false);
            }

            config[index] = this.getSettings();

            await GuildConfig.update({
                guild_id: this.main_interaction.guild.id,
                value: config,
                valueName: 'tickets',
            }).then(() => {
                return resolve(true);
            }).catch((err) => {
                errorhandler({ err });
                return reject(false);
            });
        });
    }

    get() {
        return new Promise(async (resolve, reject) => {
            await GuildConfig.get(this.main_interaction.guild.id)
                .then((config) => {
                    if (!config) return resolve(false);
                    return resolve(config.tickets);
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
                .setColor(this.defaultEmbedOptions.color)
                .setTitle(this.defaultEmbedOptions.title)
                .setDescription(this.settings.description)

            await this.settings.channel.send({ 
                embeds: [embed],
                components: [new ActionRowBuilder().addComponents(await this.generateButton())]
            }).then(async (message) => {
                return resolve(message.url);
            }).catch((err) => {
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
                .setID('create_ticket')

            return resolve(button);
        });
    }
}