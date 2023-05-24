const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const { hangmanConfig } = require('../_config/fun/hangman');
module.exports.run = async ({ main_interaction }) => {
    await main_interaction.deferReply();
};

module.exports.data = hangmanConfig;
