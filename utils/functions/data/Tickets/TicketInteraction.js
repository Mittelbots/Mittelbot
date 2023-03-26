const { EmbedBuilder } = require('discord.js');

module.exports = class TicketInteraction {
    constructor(bot, main_interaction) {
        this.main_interaction = main_interaction;
        this.bot = bot;
    }

    interacte() {
        return new Promise(async (resolve, reject) => {
            await this.getSettingsOfMessage(this.main_interaction.message.url);

            const command = this.main_interaction.customId;

            if (command === 'create_ticket') {
                const channel = await this.generateTicketChannel()
                    .then((channel) => {
                        return channel;
                    })
                    .catch((err) => {
                        return resolve(global.t.trans(['error.ticket.interacte.create']));
                    });

                await this.sendTicketChannelEmbed(channel)
                    .then(() => {
                        return resolve(
                            global.t.trans(['success.ticket.interacte.create', channel])
                        );
                    })
                    .catch((err) => {
                        return reject(global.t.trans(['error.permissions.write', channel]));
                    });

                return;
            }
        });
    }

    isUserWritingInTicket(channel_id) {
        return new Promise(async (resolve, reject) => {});
    }

    saveUserMessage(message) {
        return new Promise(async (resolve, reject) => {});
    }
};
