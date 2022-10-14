const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({
        ephemeral: true,
    });

    const mainEmbed = new EmbedBuilder()
        .setTitle('Tutorial')
        .setDescription(
            `Learn everything important about the Bot.\nPlease select one of options in the Dropdown menu to get started.\nYou can add more questions and answers in the official discord support server https://mittelbot.blackdayz.de/support`
        )
        .setImage(`https://i.pinimg.com/originals/76/ba/79/76ba795f3cd29fa90b05e52381cbf929.gif`);

    const dropdownMenu = new SelectMenuBuilder()
        .setCustomId('tutorial')
        .setPlaceholder('Choose an option');

    menu.addOptions([
        {
            value: `message_${main_interaction.guild.id}`,
            label: 'Message over of the embed',
        },
    ]);

    await main_interaction
        .followUp({
            embeds: [mainEmbed],
        })
        .catch((err) => {});
};

module.exports.data = new SlashCommandBuilder()
    .setName('tutorial')
    .setDescription('Gives you important information about the Bot and how it works');
