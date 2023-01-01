const { SlashCommandBuilder } = require('discord.js');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const config = require('../../../src/assets/json/_config/config.json');
const { Levelsystem } = require('../../../utils/functions/data/levelsystemAPI');
const { GuildConfig } = require('../../../utils/functions/data/Config');

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
            .setDescription("Select channels which won't be affected by the leveling system.")
            .addStringOption((channel) =>
                channel.setName('channel').setDescription('Chose your channels.').setRequired(true)
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
                        'Add a channel if you want to send levelup messages to a text channel'
                    )
                    .setRequired(false)
            )
    );
