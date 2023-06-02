const { StringSelectMenuBuilder } = require('discord.js');
const { ActionRowBuilder } = require('discord.js');
const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const { tutorialConfig } = require('../_config/help/tutorial');

module.exports.run = async ({ main_interaction, bot }) => {
    const mainEmbed = new EmbedBuilder()
        .setTitle('Tutorial')
        .setDescription(
            `Learn everything important about the Bot.\nPlease select one of options in the Dropdown menu to get started.\nYou can add more questions and answers in the official discord support server https://mittelbot.xyz/support`
        )
        .setImage(`https://media.giphy.com/media/VXCPgZwEP7f1e/giphy-downsized-large.gif`);

    const row = new ActionRowBuilder().addComponents(
        new StringSelectMenuBuilder()
            .setCustomId('tutorial')
            .setPlaceholder('Choose a topic to learn more about.')
            .addOptions([
                {
                    value: `commands`,
                    description: 'Wonder how to use a command?',
                    label: 'Slash Commands',
                },
                {
                    value: `permissions`,
                    description: 'Learn how the permission system works.',
                    label: 'Permissions',
                },
                {
                    value: `notifications`,
                    description: 'Learn how to get notifications from the Bot.',
                    label: 'Notifications (yt, twitch, ...)',
                },
                {
                    value: `level`,
                    description: 'Learn how the level system works.',
                    label: 'Level System',
                },
                {
                    value: `moderation`,
                    description: 'Learn how the moderation works.',
                    label: 'Moderation',
                },
                {
                    value: `automod`,
                    description: 'Learn how the automoderation works.',
                    label: 'Automoderation',
                },
                {
                    value: `scam`,
                    description: 'Learn how the scam protection works.',
                    label: 'Scam Protection',
                },
            ])
    );

    await main_interaction
        .reply({
            embeds: [mainEmbed],
            components: [row],
        })
        .catch((err) => {});
};

module.exports.data = tutorialConfig;
