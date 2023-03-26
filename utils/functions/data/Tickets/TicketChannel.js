const { ChannelType, PermissionsBitField } = require('discord.js');

module.exports = class TicketChannel {
    constructor() {}

    generateTicketChannel() {
        return new Promise(async (resolve, reject) => {
            console.log(this.settings);
            const channel_name = `ticket-${this.main_interaction.user.username}`;
            const channel = await this.main_interaction.guild.channels
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
};
