const { SlashCommandBuilder } = require('discord.js');
const Timer = require('../../../utils/functions/data/Timer');

module.exports.run = async ({ main_interaction, bot }) => {
    const type = main_interaction.options.getSubcommand();
    const days = main_interaction.options.getInteger('days') || 0;
    const hours = main_interaction.options.getInteger('hours') || 0;
    const minutes = main_interaction.options.getInteger('minutes') || 0;
    const endMessage = main_interaction.options.getString('end_message');
    const channel = main_interaction.options.getChannel('channel');

    const guildHasTimer = await new Timer().get(main_interaction.guild.id);

    if (type === 'stop') {
        new Timer().destroy(main_interaction.guild.id);
        return main_interaction.reply({ content: 'Timer stopped!', ephemeral: true });
    }

    if (guildHasTimer) {
        return main_interaction.reply({
            content: 'You already have a timer running! Delete it to add a new one.',
            ephemeral: true,
        });
    }

    if (days < 0 || hours < 0 || minutes < 0) {
        return main_interaction.reply({
            content: 'Please enter a positive number!',
            ephemeral: true,
        });
    }

    if (days === 0 && hours === 0 && minutes === 0) {
        return main_interaction.reply({
            content: 'The timer has to be longer then or equal 1 Minute!',
            ephemeral: true,
        });
    }

    const time = new Date();
    if (days > 0) time.setDate(time.getDate() + days);
    if (hours > 0) time.setHours(time.getHours() + hours);
    if (minutes > 0) time.setMinutes(time.getMinutes() + minutes);

    await channel
        .send({
            content: `**Time left:** ${days}\xA0Day(s) ${hours}\xA0Hour(s) ${minutes}\xA0Minute(s)`,
        })
        .then((msg) => {
            const timer = new Timer();
            timer
                .add({
                    guild_id: main_interaction.guild.id,
                    channel_id: channel.id,
                    started_at: new Date().getTime(),
                    ends_at: time.getTime(),
                    endMessage: endMessage,
                    message_id: msg.id,
                })
                .then(() => {
                    return main_interaction.reply({
                        content: `Timer successfully started! It will end in ${days}Day(s) ${hours}Hour(s) ${minutes} Minute(s)`,
                        ephemeral: true,
                    });
                })
                .catch((err) => {
                    main_interaction.reply({ content: 'Something went wrong!', ephemeral: true });
                    msg.delete().catch((err) => {});
                });
        });
};

module.exports.data = new SlashCommandBuilder()
    .setName('timer')
    .setDescription('Setup a timer')
    .addSubcommand((subcommand) =>
        subcommand
            .setName('start')
            .setDescription('Start a timer')

            .addIntegerOption((option) =>
                option
                    .setName('days')
                    .setDescription('How many days should the timer run? Set to 0 for zero days')
                    .setRequired(true)
            )
            .addIntegerOption((option) =>
                option
                    .setName('hours')
                    .setDescription('How many hours should the timer run? Set to 0 for zreo hours')
                    .setRequired(true)
            )
            .addIntegerOption((option) =>
                option
                    .setName('minutes')
                    .setDescription(
                        'How many minutes should the timer run? Set to 0 for zero minutes'
                    )
                    .setRequired(true)
            )
            .addStringOption((option) =>
                option
                    .setName('end_message')
                    .setDescription('What should the bot send when the timer is over?')
                    .setRequired(true)
            )
            .addChannelOption((option) =>
                option
                    .setName('channel')
                    .setDescription('In which channel should the timer be posted?')
                    .setRequired(true)
            )
    )
    .addSubcommand((subcommand) =>
        subcommand.setName('stop').setDescription('Stop the current timer in this server')
    );
