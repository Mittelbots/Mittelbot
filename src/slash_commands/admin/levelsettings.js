const { hasPermission } = require('../../../utils/functions/hasPermissions');
const config = require('../../../src/assets/json/_config/config.json');
const { Levelsystem } = require('../../../utils/functions/data/levelsystemAPI');
const { GuildConfig } = require('../../../utils/functions/data/Config');
const { levelSettingsConfig } = require('../_config/admin/levelsettings');

module.exports.run = async ({ main_interaction, bot }) => {
    const hasPermissions = await hasPermission({
        guild_id: main_interaction.guild.id,
        adminOnly: true,
        modOnly: false,
        user: main_interaction.member,
        bot,
    });
    if (!hasPermissions) {
        return main_interaction
            .reply({
                content: `<@${main_interaction.user.id}> ${config.errormessages.nopermission}`,
                ephemeral: true,
            })
            .catch((err) => {});
    }

    const guildConfig = await GuildConfig.get(main_interaction.guild.id);
    let levelsettings = guildConfig.levelsettings;

    switch (main_interaction.options.getSubcommand()) {
        case 'mode':
            const mode = main_interaction.options.getString('mode');
            levelsettings.mode = mode;

            return await GuildConfig.update({
                guild_id: main_interaction.guild.id,
                value: levelsettings,
                valueName: 'levelsettings',
            })
                .then((res) => {
                    return main_interaction.reply({
                        content: '✅ Successfully saved your level config to ' + mode,
                        ephemeral: true,
                    });
                })
                .catch((err) => {
                    return main_interaction.reply({
                        content:
                            '❌ Somethings went wrong while changing your level config to ' + mode,
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

            GuildConfig.update({
                guild_id: main_interaction.guild.id,
                value: levelsettings,
                valueName: 'levelsettings',
            })
                .then(() => {
                    return main_interaction.reply({
                        content: '✅ Successfully saved your level config.',
                        ephemeral: true,
                    });
                })
                .catch((err) => {
                    return main_interaction.reply({
                        content: '❌ Somethings went wrong while saving your level config.',
                        ephemeral: true,
                    });
                });
            break;

        case 'levelup':
            const type = main_interaction.options.getString('type');
            const channel = main_interaction.options.getChannel('channel');

            Levelsystem.changeLevelUp({
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
