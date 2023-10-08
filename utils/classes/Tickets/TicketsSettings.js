const { EmbedBuilder } = require('discord.js');
const GuildConfig = require('../Config');

module.exports = class TicketSettings {
    constructor() {}

    settings = [];
    MAX_SETTINGS = 3;

    getSettings() {
        return new Promise(async (resolve) => {
            await new GuildConfig()
                .get(this.main_interaction.guild.id)
                .then(async (config) => {
                    return resolve((this.settings = config.tickets));
                })
                .catch(() => {
                    return resolve([]);
                });
        });
    }

    getSettingsOfMessage(message_link) {
        return new Promise(async (resolve) => {
            await this.getSettings();
            return resolve(
                (this.settings = this.settings.find(
                    (setting) => setting.message_link === message_link
                ))
            );
        });
    }

    getSettingsWithChannel(channel_id) {
        return new Promise(async (resolve, reject) => {
            const ticket = await this.getTicket({
                channel_id,
            })
                .then((ticket) => {
                    return ticket;
                })
                .catch(() => {
                    return reject();
                });
            await this.getSettingsOfMessage(ticket.source_message_link)
                .then((settings) => {
                    return resolve((this.settings = settings));
                })
                .catch(() => {
                    return reject();
                });
        });
    }

    isMaxSettingsReached() {
        return new Promise(async (resolve) => {
            return resolve(this.settings.length >= this.MAX_SETTINGS);
        });
    }

    createSettings({
        channel,
        description,
        category,
        close_category,
        moderator,
        ticket_description,
        log_channel,
    }) {
        return new Promise(async (resolve, reject) => {
            await this.getSettings();
            if (await this.isMaxSettingsReached())
                return reject(
                    global.t.trans(
                        ['error.ticket.MAX_SETTINGS', this.MAX_SETTINGS],
                        this.main_interaction.guild.id
                    )
                );

            category = category ? category.id : null;
            close_category = close_category ? close_category.id : null;

            const newSettings = {
                channel,
                description,
                category,
                close_category,
                moderator,
                ticket_description,
                log_channel,
            };

            const message_link = await this.sendTicketEmbed(newSettings);
            if (!message_link) {
                return reject(global.t.trans(['error.embed.send'], this.main_interaction.guild.id));
            }

            newSettings.message_link = message_link;
            this.settings.push(newSettings);

            await new GuildConfig()
                .update({
                    guild_id: this.main_interaction.guild.id,
                    value: this.settings,
                    valueName: 'tickets',
                })
                .then(() => {
                    return resolve(
                        global.t.trans(
                            ['success.ticket.setting.set'],
                            this.main_interaction.guild.id
                        )
                    );
                })
                .catch(() => {
                    return reject(
                        global.t.trans(['error.general'], this.main_interaction.guild.id)
                    );
                });
        });
    }

    deleteSettings(message_link) {
        return new Promise(async (resolve, reject) => {
            await this.getSettings();

            const newSettings = this.settings.filter(
                (setting) => setting.message_link !== message_link
            );

            await new GuildConfig()
                .update({
                    guild_id: this.main_interaction.guild.id,
                    value: newSettings,
                    valueName: 'tickets',
                })
                .then(() => {
                    resolve();
                })
                .catch(() => {
                    reject();
                });
        });
    }
};
