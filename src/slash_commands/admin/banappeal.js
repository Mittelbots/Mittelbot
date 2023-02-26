const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const Banappeal = require('../../../utils/functions/data/Banappeal');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply({ ephemeral: true });

    const banappeal = new Banappeal(bot);

    const guild_id = main_interaction.guild.id;
    const user_id = main_interaction.user.id;

    const command = main_interaction.options.getSubcommand();

    if (command === 'test') {
        await banappeal.createBanappeal(guild_id, user_id);
        await banappeal
            .sendBanappealToUser(guild_id, user_id)
            .then(() => {
                main_interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription('The ban appeal has been sent to you via DMs.')
                            .setColor('#00FF00'),
                    ],
                    ephemeral: true,
                });
            })
            .catch(() => {
                main_interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                'An error occured while sending the ban appeal to you via DMs. Please make sure you have DMs enabled.'
                            )
                            .setColor('#FF0000'),
                    ],
                    ephemeral: true,
                });
            });
        return;
    }

    if (command === 'remove') {
        return banappeal
            .removeBanappeal(guild_id, user_id)
            .then(() => {
                main_interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription('The ban appeal has been removed from your server.')
                            .setColor('#00FF00'),
                    ],
                    ephemeral: true,
                });
            })
            .catch(() => {
                main_interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                'An error occured while removing the ban appeal from your server.'
                            )
                            .setColor('#FF0000'),
                    ],
                    ephemeral: true,
                });
            });
    }

    const title = main_interaction.options.getString('title');
    const description = main_interaction.options.getString('description');
    const questions = main_interaction.options.getString('questions');
    const channel = main_interaction.options.getChannel('channel');
    const cooldown = main_interaction.options.getNumber('cooldown');
    console.log(cooldown);
    const questions_array = questions.split(',');

    const settings = {
        title,
        description,
        questions: questions_array,
        channel_id: channel.id,
        cooldown: cooldown,
    };

    banappeal
        .updateBanappealSettings(guild_id, settings)
        .then(() => {
            const exampleEmbed = new EmbedBuilder()
                .setTitle(title)
                .setDescription(description)
                .setColor('#f44336');

            for (let i in questions_array) {
                exampleEmbed.addFields({
                    name: `Question ${parseInt(i) + 1}`,
                    value: questions_array[i],
                });
            }

            main_interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            'The ban appeal has been setup for your server. An example of how it will look will be sent to the channel you specified.'
                        )
                        .setColor('#00FF00'),
                ],
                ephemeral: true,
            });

            channel
                .send({
                    embeds: [exampleEmbed],
                })
                .catch(() => {
                    main_interaction.editReply({
                        embeds: [
                            new EmbedBuilder()
                                .setDescription(
                                    'An error occured while sending the example to the channel you specified. Please make sure I have the correct permissions or the bot is not able to send any Appeals.'
                                )
                                .setColor('#FF0000'),
                        ],
                        ephemeral: true,
                    });
                });
        })
        .catch(() => {
            main_interaction.editReply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            'An error occured while setting up the ban appeal for your server.'
                        )
                        .setColor('#FF0000'),
                ],
                ephemeral: true,
            });
        });
};

module.exports.data = new SlashCommandBuilder()
    .setName('banappeal')
    .setDescription(
        'Setup a ban appeal for your server which gets send to the user when they get banned.'
    )
    .addSubcommand((subcommand) =>
        subcommand
            .setName('add')
            .setDescription('Setup a ban appeal for your server. {user} and {guild} are supported.')
            .addStringOption((option) =>
                option
                    .setName('title')
                    .setDescription('This will be displayed above the description.')
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('description')
                    .setDescription('This will be displayed above the questions.')
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('questions')
                    .setDescription(
                        'Separate them with a comma. It will be displayed in the order you enter them.'
                    )
                    .setRequired(true)
            )
            .addChannelOption((option) =>
                option
                    .setName('channel')
                    .setDescription('The channel where the ban appeal will be sent to.')
                    .setRequired(true)
            )
            .addNumberOption((option) =>
                option
                    .setName('cooldown')
                    .setDescription(
                        'The cooldown in days for the ban appeal. Default is 0 (no cooldown).'
                    )
                    .setRequired(false)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand.setName('remove').setDescription('Remove the ban appeal from your server.')
    )
    .addSubcommand((subcommand) =>
        subcommand.setName('test').setDescription('Test the ban appeal for your server.')
    );
