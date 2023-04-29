const config = require('../../../src/assets/json/_config/config.json');
const {
    TextInputBuilder,
    SlashCommandBuilder,
    ModalBuilder,
    ActionRowBuilder,
    TextInputStyle,
} = require('discord.js');

module.exports.run = async ({ main_interaction, bot }) => {
    if (main_interaction.user.id !== config.Bot_Owner_ID) return;
    const modal = new ModalBuilder().setTitle('Test').setCustomId('test');

    const textInput = new TextInputBuilder()
        .setLabel('Text')
        .setCustomId('text')
        .setStyle(TextInputStyle.Paragraph)
        .setRequired(true);

    const first = new ActionRowBuilder().addComponents([textInput]);
    modal.addComponents([first]);

    main_interaction.showModal(modal);
};

module.exports.data = new SlashCommandBuilder()
    .setName('test')
    .setDescription('Nothing.')
    .setDefaultMemberPermissions(0);

module.exports.permissions = {
    adminOnly: true,
    modOnly: false,
    guildOwnerOnly: false,
    requirePerms: [],
    botOwnerOnly: true,
};
