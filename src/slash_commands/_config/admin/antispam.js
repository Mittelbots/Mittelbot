const { SlashCommandBuilder } = require('discord.js');

module.exports.antiSpamConfig = new SlashCommandBuilder()
    .setName('antispam')
    .setDescription('Configure anti spam settings.')
    .addStringOption((option) =>
        option
            .setName('enabled')
            .setDescription('Enable/disable anti-spam.')
            .setRequired(true)
            .addChoices({
                name: 'true',
                value: 'true',
            })
            .addChoices({
                name: 'false',
                value: 'false',
            })
    )
    .addStringOption((option) =>
        option
            .setName('action')
            .setDescription('Select an action to take.')
            .setRequired(true)
            .addChoices({
                name: 'ban',
                value: 'ban',
            })
            .addChoices({
                name: 'kick',
                value: 'kick',
            })
            .addChoices({
                name: 'mute',
                value: 'mute',
            })
            .addChoices({
                name: 'delete',
                value: 'delete',
            })
            .addChoices({
                name: 'warn',
                value: 'warn',
            })
    )
    .addBooleanOption((option) =>
        option
            .setName('detectduplicate')
            .setDescription('Detect duplicate links.')
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('whitelistroles')
            .setDescription('Whitelist a role. [@role1, @role2, ...]')
            .setRequired(false)
    )
    .addStringOption((option) =>
        option
            .setName('whitelistchannels')
            .setDescription('Whitelist a channel. [#channel1, #channel2, ...]')
            .setRequired(false)
    )
    .addNumberOption((option) =>
        option
            .setName('pinglimit')
            .setDescription('Set the ping limit. Default: Off. Minimum: 3.')
            .setRequired(false)
    );

module.exports.antiSpamPerms = {
    adminOnly: true,
    modOnly: false,
    guildOwnerOnly: false,
    requirePerms: [],
    botOwnerOnly: false,
};
