const { SlashCommandBuilder } = require('discord.js');
const SingASong = require('../../../utils/functions/data/SingASong');

module.exports.run = async ({ main_interaction, bot }) => {
    const singasong = new SingASong(main_interaction, bot);

    switch (main_interaction.options.getSubcommand()) {
        case 'start':
            const check = singasong.initCheck();

            if (typeof check === 'string') {
                return main_interaction.reply({ content: check, ephemeral: true });
            }

            singasong.start().catch((err) => {
                return main_interaction.reply({ content: err, ephemeral: true });
            });
            break;
        case 'view_my_points':
            const points = await singasong.getPointsFromUser(main_interaction.user.id);
            if (!points)
                return main_interaction.reply({ content: 'You have no points!', ephemeral: true });
            main_interaction.reply({ content: `You have ${points} points!`, ephemeral: true });
            break;
        case 'view':
            main_interaction.reply({
                content: 'This command is currently disabled!',
                ephemeral: true,
            });
            break;
        case 'ban':
            await singasong
                .banUser(main_interaction.options.getUser('user').id, main_interaction.guild.id)
                .then(() => {
                    main_interaction.reply({ content: 'User has been banned!', ephemeral: true });
                })
                .catch((err) => {
                    main_interaction.reply({ content: err, ephemeral: true });
                });
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
        subcommand
            .setName('ban')
            .setDescription('[MOD ONLY] Prevent a user from using the command')
            .addUserOption((option) =>
                option.setName('user').setDescription('The user to ban').setRequired(true)
            )
    );
