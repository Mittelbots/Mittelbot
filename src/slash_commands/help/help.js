const cmd_help = require('~assets/json/command_config/command_help.json');
const { EmbedBuilder } = require('discord.js');
const { errorhandler } = require('~utils/functions/errorhandler/errorhandler');
const { SlashCommandBuilder } = require('discord.js');
const { ActionRowBuilder } = require('discord.js');
const { ButtonBuilder } = require('discord.js');
const { ButtonStyle } = require('discord.js');
const { helpConfig } = require('../_config/help/help');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

    const helpEmbedMessage = new EmbedBuilder()
        .setTitle('Everything you need to know from each Command \n Choose a category')
        .setDescription(
            'Something wrong? Report it on my discord https://mittelbot.xyz/support \n _All commands are slash commands (/)_ '
        );

    for (const [index, [key, value]] of Object.entries(Object.entries(cmd_help))) {
        helpEmbedMessage.addFields([
            {
                name: `${value._icon} ${key.charAt(0).toUpperCase() + key.slice(1)}`,
                value: value._desc,
            },
        ]);
    }

    const row = new ActionRowBuilder();

    function addCategorieButtons() {
        for (let i in cmd_help) {
            const newButton = new ButtonBuilder()
                .setCustomId(cmd_help[i]._name)
                .setLabel(i.charAt(0).toUpperCase() + i.slice(1))
                .setStyle(ButtonStyle.Primary)
                .setEmoji(cmd_help[i]._icon);

            row.addComponents(newButton);
        }
    }
    addCategorieButtons();

    function addHomeButton() {
        const newButton = new ButtonBuilder()
            .setCustomId('home')
            .setLabel('Home')
            .setStyle(ButtonStyle.Primary)
            .setEmoji('🏠');

        row.addComponents(newButton);
    }

    function removeAllButtons() {
        row.components = [];
    }

    const helpMessage = await main_interaction
        .followUp({
            embeds: [helpEmbedMessage],
            components: [row],
            fetchReply: true,
            ephemeral: true,
        })
        .then((msg) => {
            return msg;
        })
        .catch((err) => {
            errorhandler({ err });
            return;
        });

    const collector = helpMessage.createMessageComponentCollector({
        time: 180000,
    });

    collector.on('collect', async (reaction, user) => {
        let buttonPressed;

        reaction.message.components[0].components.forEach((button) => {
            if (reaction.customId === button.customId) {
                buttonPressed = button.data;
            }
        });

        if (reaction.customId === 'home') {
            removeAllButtons();
            addCategorieButtons();
            await reaction
                .update({
                    embeds: [helpEmbedMessage],
                    components: [row],
                    fetchReply: true,
                })
                .catch((err) => {});
            return;
        }

        for (const [index, [key, value]] of Object.entries(Object.entries(cmd_help))) {
            if (value._icon !== buttonPressed.emoji.name) continue;

            const edithelpEmbedMessage = new EmbedBuilder()
                .setTitle(`Settings for ${key.charAt(0).toUpperCase() + key.slice(1)}`)
                .setDescription(
                    "Something wrong? Report it on my discord https://discord.gg/5d5ZDFQM4E \n _I'll use the default prefix '!'_ "
                );

            for (let i in value) {
                if (typeof value[i] === 'object') {
                    edithelpEmbedMessage.addFields([
                        {
                            name: `${value[i].icon || ''} ${
                                value[i].name.charAt(0).toUpperCase() + value[i].name.slice(1)
                            }`,
                            value: `${value[i].description || 'Not set yet'} \n${
                                '**' + value[i].usage + '**' || 'Not set'
                            }`,
                        },
                    ]);
                }
            }
            removeAllButtons();
            addHomeButton();
            await reaction
                .update({
                    embeds: [edithelpEmbedMessage],
                    components: [row],
                    fetchReply: true,
                })
                .catch((err) => {
                    errorhandler({ err });
                });
            return;
        }
    });

    collector.on('end', (collected, reason) => {
        try {
            if (reason === 'time') {
                main_interaction
                    .editReply({
                        content: '**Time limit reached**',
                        components: [],
                    })
                    .catch((err) => {});
            } else {
                main_interaction.editReply({
                    content: `**Collector ended cause: ${reason}**`,
                    components: [],
                });
            }
        } catch (err) {}
    });
};

module.exports.data = helpConfig;
