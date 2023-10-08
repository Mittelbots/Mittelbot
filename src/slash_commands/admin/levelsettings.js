const Levelsystem = require('~utils/classes/levelsystemAPI');
const GuildConfig = require('~utils/classes/Config');
const { levelSettingsConfig, levelsettingsPerms } = require('../_config/admin/levelsettings');
const { EmbedBuilder } = require('discord.js');

module.exports.run = async ({ main_interaction, bot }) => {
    const guildConfig = await new GuildConfig().get(main_interaction.guild.id);
    let levelsettings = guildConfig.levelsettings;

    switch (main_interaction.options.getSubcommand()) {
        case 'mode':
            const mode = main_interaction.options.getString('mode');
            levelsettings.mode = mode;

            return await new GuildConfig()
                .update({
                    guild_id: main_interaction.guild.id,
                    value: levelsettings,
                    valueName: 'levelsettings',
                })
                .then((res) => {
                    return main_interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(
                                        ['success.admin.levelsettings.set', mode],
                                        main_interaction.guild.id
                                    )
                                )
                                .setColor(global.t.trans(['general.colors.success'])),
                        ],
                        ephemeral: true,
                    });
                })
                .catch((err) => {
                    return main_interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(
                                        ['error.admin.levelsettings.set', mode],
                                        main_interaction.guild.id
                                    )
                                )
                                .setColor(global.t.trans(['general.colors.error'])),
                        ],
                        ephemeral: true,
                    });
                });

        case 'blacklistchannels':
            let channels = [];
            for (let i = 1; i <= 5; i++) {
                const channel = main_interaction.options.getChannel(`channel${i}`);
                if (channel) {
                    channels.push(channel);
                }
            }

            if (!levelsettings.blacklistchannels) {
                levelsettings.blacklistchannels = [];
            }

            if (main_interaction.options.getString('clear')) {
                for (let i = 0; i < channels.length; i++) {
                    const index = levelsettings.blacklistchannels.indexOf(channels[i].id);
                    if (index > -1) {
                        levelsettings.blacklistchannels.splice(index, 1);
                    }
                }
            } else {
                for (let i = 0; i < channels.length; i++) {
                    if (!levelsettings.blacklistchannels.includes(channels[i].id)) {
                        levelsettings.blacklistchannels.push(channels[i].id);
                    }
                }
            }

            new GuildConfig()
                .update({
                    guild_id: main_interaction.guild.id,
                    value: levelsettings,
                    valueName: 'levelsettings',
                })
                .then(() => {
                    return main_interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(
                                        ['success.levelsettings.setAlone'],
                                        main_interaction.guild.id
                                    )
                                )
                                .setColor(global.t.trans(['general.colors.success'])),
                        ],
                        ephemeral: true,
                    });
                })
                .catch((err) => {
                    return main_interaction.reply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    global.t.trans(
                                        ['error.admin.levelsettings.setAlone'],
                                        main_interaction.guild.id
                                    )
                                )
                                .setColor(global.t.trans(['general.colors.success'])),
                        ],
                        ephemeral: true,
                    });
                });
            break;

        case 'levelup':
            const type = main_interaction.options.getString('type');
            const channel = main_interaction.options.getChannel('channel');

            new Levelsystem()
                .changeLevelUp({
                    type,
                    guild: main_interaction.guild,
                    channel,
                })
                .then((res) => {
                    return main_interaction
                        .reply({
                            content: res,
                            ephemeral: true,
                        })
                        .catch((err) => {});
                })
                .catch((err) => {
                    return main_interaction
                        .reply({
                            content: err,
                            ephemeral: true,
                        })
                        .catch((err) => {});
                });
            break;
    }
};

module.exports.data = levelSettingsConfig;
module.exports.permissions = levelsettingsPerms;
