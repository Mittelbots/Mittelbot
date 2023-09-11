const { ButtonStyle } = require('discord.js');
const { ActionRowBuilder } = require('discord.js');
const { ButtonBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const { errorhandler } = require('~utils/functions/errorhandler/errorhandler');
const { kickUser } = require('~utils/functions/moderations/kickUser');
const { kickmeConfig } = require('../_config/utils/kickme');

module.exports.run = async ({ main_interaction, bot }) => {
    const user = main_interaction.user;

    await main_interaction.deferReply({
        ephemeral: true,
    });

    const buttons = new ButtonBuilder()
        .setLabel('CANCEL')
        .setStyle(ButtonStyle.Danger)
        .setCustomId('kickme_cancel');

    const message = await main_interaction
        .editReply({
            content: `⚠️ **YOU WILL BE KICKED IN 10 SECCONDS. TO CANCEL THIS CLICK THE BUTTON**`,
            components: [
                new ActionRowBuilder({
                    components: [buttons],
                }),
            ],
            fetchReply: true,
        })
        .catch((err) => {
            return false;
        });

    const collector = message.createMessageComponentCollector({
        filter: ({ user }) => user.id === main_interaction.user.id,
        max: 1,
        time: 10000,
    });

    collector.on('collect', async (interaction) => {
        return await interaction
            .update({
                content: `✅ Successfully canceled.`,
                components: [],
                fetchReply: true,
            })
            .catch(() => {});
    });

    collector.on('end', async (collected, reason) => {
        if (reason === 'time') {
            kickUser({
                user,
                mod: bot.user,
                guild: main_interaction.guild,
                reason: 'User executed /kickme command.',
                bot,
            })
                .then(() => {
                    errorhandler({
                        fatal: false,
                        message: `${user.id} has triggered the /kickme command successfully.`,
                        id: 1694432973,
                    });
                })
                .catch(() => {
                    main_interaction.editReply({
                        content: `❌ I don't have permissions to kick you.`,
                        components: [],
                        fetchReply: true,
                    });
                });
        }
    });
};

module.exports.data = kickmeConfig;
