const { EmbedBuilder } = require('discord.js');

module.exports = class TicketInteraction {
    constructor(bot, main_interaction) {
        this.main_interaction = main_interaction;
        this.bot = bot;
    }

    interacte() {
        return new Promise(async (resolve, reject) => {
            const interaction = this.main_interaction.customId;

            if (interaction === 'create_ticket') {
                const settings = await this.getSettingsOfMessage(this.main_interaction.message.url);
                if (!settings) return resolve();

                await this.create()
                    .then((message) => {
                        resolve(message);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            } else if (interaction === 'close_ticket' && (await this.isModerator())) {
                await this.close()
                    .then((message) => {
                        resolve(message);
                    })
                    .catch((err) => {
                        reject(err);
                    });
            } else if (interaction === 'save_ticket' && (await this.isModerator())) {
                const serverSettings = await this.getSettingsWithChannel(
                    this.main_interaction.channel.id
                );
                const ticketSettings = await this.getTicket({
                    channel_id: this.main_interaction.channel.id,
                });

                if (!serverSettings || !ticketSettings) return resolve();
                await this.saveTranscript(serverSettings, ticketSettings)
                    .then(() => {
                        resolve();
                    })
                    .catch((err) => {
                        reject(err);
                    });
            } else if (interaction === 'delete_ticket' && (await this.isModerator())) {
                await this.delete()
                    .then(() => {
                        resolve();
                    })
                    .catch((err) => {
                        reject(err);
                    });
            }

            resolve();
        });
    }

    create() {
        return new Promise(async (resolve, reject) => {
            const userhasTicket = await this.hasUserAlreadyTicket(
                this.main_interaction.message.url
            ).catch((err) => {
                return reject(
                    global.t.trans(
                        ['error.generalWithMessage', err],
                        this.main_interaction.guild.id
                    )
                );
            });

            if (userhasTicket) {
                return reject(global.t.trans(['error.ticket.interacte.hasTicketAlready']));
            }

            const channel = await this.generateTicketChannel().catch((err) => {
                return resolve(
                    global.t.trans(
                        ['error.ticket.interacte.create'],
                        this.main_interaction.guild.id
                    )
                );
            });

            Promise.all([
                await this.sendTicketChannelEmbed(channel),
                await this.saveTicket(channel),
            ])
                .then(() => {
                    return resolve(
                        global.t.trans(
                            ['success.ticket.interacte.create', channel],
                            this.main_interaction.guild.id
                        )
                    );
                })
                .catch((err) => {
                    return reject(
                        global.t.trans(
                            ['error.generalWithMessage', err],
                            this.main_interaction.guild.id
                        )
                    );
                });
        });
    }

    close() {
        return new Promise(async (resolve, reject) => {
            await this.closeTicket()
                .then(() => {
                    Promise.all([
                        this.setOwnerPermissionsToFalse(),
                        this.moveChannelToClosedCategory(),
                        this.clearBtns(),
                        this.generateDeleteButton(),
                        this.generateTranscriptButton(),
                        this.appendButtons(),
                    ])
                        .then(() => {
                            resolve(
                                global.t.trans(
                                    ['success.ticket.interacte.close'],
                                    this.main_interaction.guild.id
                                )
                            );
                        })
                        .catch((err) => {
                            reject(
                                global.t.trans(
                                    ['error.ticket.interacte.close'],
                                    this.main_interaction.guild.id
                                )
                            );
                        });
                })
                .catch((err) => {
                    reject(
                        global.t.trans(
                            ['error.ticket.interacte.close'],
                            this.main_interaction.guild.id
                        )
                    );
                });
        });
    }

    saveTranscript(serverSettings, ticket) {
        return new Promise(async (resolve, reject) => {
            const channel = this.main_interaction.bot.channels.cache.get(
                this.main_interaction.channel.id
            );
            const transcript = await this.generateTranscript(channel);

            const embed = new EmbedBuilder()
                .setTitle(
                    global.t.trans(
                        ['info.ticket.transcript.title', this.main_interaction.channel.name],
                        this.main_interaction.guild.id
                    )
                )
                .addFields(
                    {
                        name: global.t.trans(
                            ['info.ticket.transcript.fields.id'],
                            this.main_interaction.guild.id
                        ),
                        value: ticket.id.toString(),
                        inline: true,
                    },
                    {
                        name: global.t.trans(
                            ['info.ticket.transcript.fields.openedBy'],
                            this.main_interaction.guild.id
                        ),
                        value: `<@${ticket.owner}>`,
                        inline: false,
                    },
                    {
                        name: global.t.trans(
                            ['info.ticket.transcript.fields.closedBy'],
                            this.main_interaction.guild.id
                        ),
                        value: `<@${ticket.closed_by}>`,
                        inline: true,
                    },
                    {
                        name: global.t.trans(
                            ['info.ticket.transcript.fields.createdAt'],
                            this.main_interaction.guild.id
                        ),
                        value: `<t:${new Date(ticket.createdAt).getTime()}:F>`,
                        inline: false,
                    }
                );

            const logChannel = this.main_interaction.bot.channels.cache.get(
                serverSettings.log_channel
            );

            logChannel
                .send({
                    embeds: [embed],
                    files: [transcript],
                })
                .then(async () => {
                    await this.main_interaction
                        .reply({
                            content: global.t.trans(
                                ['success.ticket.interacte.saveTranscript'],
                                this.main_interaction.guild.id
                            ),
                            ephemeral: true,
                        })
                        .catch(() => {});

                    Promise.all([
                        await this.clearBtns(),
                        await this.generateDeleteButton(),
                        await this.appendButtons(),
                    ])
                        .then(() => {
                            resolve();
                        })
                        .catch((err) => {
                            reject(
                                global.t.trans(['error.general'], this.main_interaction.guild.id)
                            );
                        });
                })
                .catch(() => {});
        });
    }

    delete() {
        return new Promise(async (resolve, reject) => {
            Promise.all([await this.clearBtns(), await this.appendButtons()])
                .then(async () => {
                    await this.main_interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(
                                        ['info.ticket.deletedTicket'],
                                        this.main_interaction.guild.id
                                    )
                                )
                                .setColor(global.t.trans(['general.colors.info'])),
                        ],
                    });
                    setTimeout(async () => {
                        this.main_interaction.channel.delete().catch(() => {
                            reject(
                                global.t.trans(
                                    ['error.permissions.bot.channelDelete'],
                                    this.main_interaction.guild.id
                                )
                            );
                        });
                    }, 5100); // 5 seconds + 100ms Delay
                    resolve();
                })
                .catch((err) => {
                    reject(global.t.trans(['error.general'], this.main_interaction.guild.id));
                });
        });
    }

    isModerator() {
        return new Promise(async (resolve) => {
            await this.isTicketModerator()
                .then((isTicketModerator) => {
                    resolve(isTicketModerator);
                })
                .catch(async () => {
                    resolve(false);
                });
        });
    }
};
