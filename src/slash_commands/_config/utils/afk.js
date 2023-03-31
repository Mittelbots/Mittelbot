const { SlashCommandBuilder } = require('discord.js');

module.exports.afkConfig = new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Set you to afk.')
    .addSubcommand((subcommand) => subcommand.setName('set').setDescription('Set your afk state.'))
    .addSubcommand((subcommand) =>
        subcommand.setName('remove').setDescription('Remove your afk state.')
    );
