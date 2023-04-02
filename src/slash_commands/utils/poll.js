const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const { pollConfig } = require('../_config/utils/poll');

module.exports.run = async ({ main_interaction, bot }) => {
    const question = main_interaction.options.getString('question');

    const embed = new EmbedBuilder()
        .setDescription(`**${question}**`)
        .setFooter({
            text: `Poll created by ${main_interaction.user.tag}`,
        })
        .setTimestamp();

    const msg = await main_interaction
        .reply({ embeds: [embed], fetchReply: true })
        .catch(async () => {
            await main_interaction
                .reply({
                    content: 'There was an error while creating the poll',
                    ephemeral: true,
                })
                .catch((err) => {});
        });

    await msg.react('👍').catch(async () => {
        await main_interaction
            .reply({
                content: 'There was an error while reacting to the poll',
                ephemeral: true,
            })
            .catch((err) => {});
    });
    await msg.react('👎').catch(async () => {
        await main_interaction
            .reply({
                content: 'There was an error while reacting to the poll',
                ephemeral: true,
            })
            .catch((err) => {});
    });
};

module.exports.data = pollConfig;
