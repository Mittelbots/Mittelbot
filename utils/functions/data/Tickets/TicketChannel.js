const { ChannelType, PermissionsBitField } = require('discord.js');

module.exports = class TicketChannel {
    constructor() {}

    generateTicketChannel() {
        return new Promise(async (resolve, reject) => {
            const channel_name = `ticket-${this.main_interaction.user.username}`;
            await this.main_interaction.guild.channels
                .create({
                    name: channel_name,
                    type: ChannelType.GuildText,
                    parent: this.settings.category,
                    permissionOverwrites: [
                        {
                            id: this.main_interaction.guild.id,
                            deny: [PermissionsBitField.Flags.ViewChannel],
                            allow: [PermissionsBitField.Flags.SendMessages],
                        },
                        {
                            id: this.main_interaction.user.id,
                            allow: [PermissionsBitField.Flags.ViewChannel],
                        },
                    ],
                })
                .then((channel) => {
                    if (this.settings.moderator && this.settings.moderator.length > 0) {
                        for (let i in this.settings.moderator) {
                            channel.permissionOverwrites.set([
                                {
                                    id: this.settings.moderator[i],
                                    allow: [PermissionsBitField.Flags.ViewChannel],
                                },
                                {
                                    id: this.main_interaction.guild.id,
                                    deny: [PermissionsBitField.Flags.ViewChannel],
                                },
                            ]);
                        }
                    }

                    resolve(channel);
                })
                .catch((err) => {
                    reject(err.message);
                });
        });
    }

    setOwnerPermissionsToFalse() {
        return new Promise(async (resolve, reject) => {
            const ticket = await this.getTicket({
                channel_id: this.main_interaction.channel.id,
            });
            await this.main_interaction.channel.permissionOverwrites
                .set([
                    {
                        id: ticket.owner,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                    {
                        id: this.main_interaction.guild.id,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                ])
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    reject(err.message);
                });
        });
    }

    moveChannelToClosedCategory() {
        return new Promise(async (resolve, reject) => {
            await this.getSettingsWithChannel(this.main_interaction.channel.id);
            await this.main_interaction.channel
                .setParent(this.settings.close_category)
                .then(() => {
                    resolve();
                })
                .catch((err) => {
                    reject(err.message);
                });
        });
    }
};
