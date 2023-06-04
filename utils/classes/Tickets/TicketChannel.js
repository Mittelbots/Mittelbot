const { ChannelType, PermissionsBitField } = require('discord.js');
const GuildConfig = require('../Config');

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
                        },
                        {
                            id: this.main_interaction.user.id,
                            allow: [
                                PermissionsBitField.Flags.ViewChannel,
                                PermissionsBitField.Flags.SendMessages,
                                PermissionsBitField.Flags.ReadMessageHistory,
                                PermissionsBitField.Flags.AttachFiles,
                                PermissionsBitField.Flags.EmbedLinks,
                            ],
                        },
                    ],
                })
                .then((channel) => {
                    this.setModeratorPermissionsToChannel(channel);

                    resolve(channel);
                })
                .catch((err) => {
                    reject(err.message);
                });
        });
    }

    setModeratorPermissionsToChannel(channel) {
        return new Promise(async (resolve) => {
            if (!this.settings.moderator || this.settings.moderator.length < 1) {
                const guildConfig = await new GuildConfig().get(this.main_interaction.guild.id);
                const serverModerators = guildConfig.modroles;

                if (!serverModerators || serverModerators.length < 1) {
                    return resolve();
                }
                this.settings.moderator = serverModerators.map((role) => role.role);
            }

            for (let i in this.settings.moderator) {
                channel.permissionOverwrites.edit(this.settings.moderator[i], {
                    ViewChannel: true,
                    ManageMessages: true,
                    EmbedLinks: true,
                    AttachFiles: true,
                    ReadMessageHistory: true,
                    SendMessages: true,
                    AddReactions: true,
                });
            }

            resolve();
        });
    }

    setOwnerPermissionsToFalse() {
        return new Promise(async (resolve, reject) => {
            const ticket = await this.getTicket({
                channel_id: this.main_interaction.channel.id,
            });
            await this.main_interaction.channel.permissionOverwrites
                .edit(ticket.owner, {
                    ViewChannel: false,
                })
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
