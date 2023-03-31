const { SlashCommandBuilder } = require('discord.js');

module.exports.singasongConfig = new SlashCommandBuilder()
    .setName('singasong')
    .setDescription('Sing a song with a random quote!')
    .addSubcommand((subcommand) =>
        subcommand.setName('start').setDescription('Start singing a song')
    )
    .addSubcommand((subcommand) =>
        subcommand.setName('view_my_points').setDescription('View your points')
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('view')
            .setDescription('[MOD ONLY] View all points for a user or all users')
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('ban')
            .setDescription('[MOD ONLY] Prevent a user from using the command')
            .addUserOption((option) =>
                option.setName('user').setDescription('The user to ban').setRequired(true)
            )
    );
