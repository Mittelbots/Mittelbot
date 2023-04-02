const { SlashCommandBuilder } = require('discord.js');

module.exports.checkguildConfig = new SlashCommandBuilder()
    .setName('checkguild')
    .setDescription('Get informations about another guild. (I must be a member of this guild!')
    .addStringOption((option) =>
        option.setName('guildid').setDescription('Enter the guild id.').setRequired(true)
    );
