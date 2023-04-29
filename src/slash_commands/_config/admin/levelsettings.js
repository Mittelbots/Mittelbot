const { SlashCommandBuilder } = require('discord.js');

module.exports.levelSettingsConfig = new SlashCommandBuilder()
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

module.exports.levelsettingsPerms = {
    adminOnly: true,
    modOnly: false,
    guildOwnerOnly: false,
    requirePerms: [],
    botOwnerOnly: false,
};
