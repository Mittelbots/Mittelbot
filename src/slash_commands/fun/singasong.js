const { SlashCommandBuilder } = require('discord.js');
const SingASong = require('../../../utils/functions/data/SingASong');

module.exports.run = async ({ main_interaction, bot }) => {
    const singasong = new SingASong(main_interaction, bot);

    const check = singasong.initCheck();

    if (typeof check === 'string') {
        return main_interaction.reply({ content: check, ephemeral: true });
    }

    switch (main_interaction.options.getSubcommand()) {
        case 'start':
            singasong.start().catch((err) => {
                return main_interaction.reply({ content: err, ephemeral: true });
            });
            break;
        case 'view_my_points':
            break;
        case 'view':
            break;
        case 'ban':
            break;
    }
};

module.exports.data = new SlashCommandBuilder()
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
        subcommand.setName('ban').setDescription('[MOD ONLY] Prevent a user from using the command')
    );
