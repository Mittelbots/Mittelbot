const { SlashCommandBuilder } = require('discord.js');
const { updateGuildConfig, getGuildConfig } = require('../../../utils/functions/data/getConfig');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const config = require('../../../src/assets/json/_config/config.json');
const { changeLevelUp } = require('../../../utils/functions/levelsystem/levelsystemAPI');

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

    switch (main_interaction.options.getSubcommand()) {
        case 'mode':
            const mode = main_interaction.options.getString('mode');

            const { settings } = await getGuildConfig({
                guild_id: main_interaction.guild.id,
            });

            var levelsettings;
            try {
                levelsettings = JSON.parse(settings.levelsettings) || {};
            } catch (e) {
                levelsettings = settings.levelsettings;
            }

            levelsettings.mode = mode;

            return await updateGuildConfig({
                guild_id: main_interaction.guild.id,
                value: JSON.stringify(levelsettings),
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
                            '❌ Somethings went wrong while changing your level confit to ' + mode,
                        ephemeral: true,
                    });
                });

        case 'blacklistchannels':
            var channels = [];
            for (let i = 1; i <= 5; i++) {
                const channel = main_interaction.options.getChannel(`channel${i}`);
                if (channel) {
                    channels.push(channel);
                }
            }

            const guilConfig = await getGuildConfig({
                guild_id: main_interaction.guild.id,
            });

            var levelsettings;
            if (!guilConfig.settings.levelsettings) {
                guilConfig.settings.levelsettings = {};
            }

            try {
                levelsettings = JSON.parse(guilConfig.settings.levelsettings);
            } catch (err) {
                levelsettings = {};
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

            updateGuildConfig({
                guild_id: main_interaction.guild.id,
                value: JSON.stringify(levelsettings),
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

        case 'levelup':
            const type = main_interaction.options.getString('type');
            const channel = main_interaction.options.getChannel('channel');

            changeLevelUp({
                type,
                guild: main_interaction.guild,
                channel,
            })
                .then((res) => {
                    main_interaction
                        .reply({
                            content: res,
                            ephemeral: true,
                        })
                        .catch((err) => {});
                })
                .catch((err) => {
                    main_interaction
                        .reply({
                            content: err,
                            ephemeral: true,
                        })
                        .catch((err) => {});
                });
            break;
    }
};

module.exports.data = new SlashCommandBuilder()
    .setName('levelsettings')
    .setDescription('Translate messages from one language to another into a given Channel.')
    .addSubcommand((command) =>
        command
            .setName('mode')
            .setDescription('Select your mode for the levels. Easy, normal, hard.')
            .addStringOption((dmcau) =>
                dmcau
                    .setName('mode')
                    .setDescription(
                        'Easy: Fast level up, normal: normal time to level up, hard: Will take some time to level up'
                    )
                    .setRequired(true)
                    .addChoices({
                        name: 'Easy',
                        value: 'easy',
                    })
                    .addChoices({
                        name: 'Normal',
                        value: 'normal',
                    })
                    .addChoices({
                        name: 'Hard',
                        value: 'hard',
                    })
            )
    )
    .addSubcommand((command) =>
        command
            .setName('blacklistchannels')
            .setDescription(
                "Select up to 5 channel at once which won't be affected by the leveling system."
            )
            .addChannelOption((channel) =>
                channel.setName('channel1').setDescription('Choose the channel.').setRequired(true)
            )
            .addChannelOption((channel) =>
                channel.setName('channel2').setDescription('Choose the channel.').setRequired(false)
            )
            .addChannelOption((channel) =>
                channel.setName('channel3').setDescription('Choose the channel.').setRequired(false)
            )
            .addChannelOption((channel) =>
                channel.setName('channel4').setDescription('Choose the channel.').setRequired(false)
            )
            .addChannelOption((channel) =>
                channel.setName('channel5').setDescription('Choose the channel.').setRequired(false)
            )
            .addStringOption((string) =>
                string
                    .setName('clear')
                    .setDescription('Clear your selected channels from the levelsettings.')
                    .setRequired(false)
                    .addChoices({
                        name: 'Clear',
                        value: 'clear',
                    })
            )
    )
    .addSubcommand((command) =>
        command
            .setName('levelup')
            .setDescription('Change the way the user get the levelup message')
            .addStringOption((option) =>
                option
                    .setName('type')
                    .setDescription('Select between dm or text channel.')
                    .setRequired(true)
                    .addChoices({
                        name: 'DM',
                        value: 'dm',
                    })
                    .addChoices({
                        name: 'Text Channel',
                        value: 'channel',
                    })
                    .addChoices({
                        name: 'Disable',
                        value: 'disable',
                    })
            )
            .addChannelOption((option) =>
                option
                    .setName('channel')
                    .setDescription(
                        'Add a chennel if you want to send levelup messages to a text channel'
                    )
                    .setRequired(false)
            )
    );
