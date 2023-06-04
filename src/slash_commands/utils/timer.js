const { SlashCommandBuilder } = require('discord.js');
const Timer = require('~utils/classes/Timer');
const { timerConfig } = require('../_config/utils/timer');

module.exports.run = async ({ main_interaction, bot }) => {
    const type = main_interaction.options.getSubcommand();
    const date = main_interaction.options.getString('date');
    const time = main_interaction.options.getString('time');
    const endMessage = main_interaction.options.getString('end_message');
    const channel = main_interaction.options.getChannel('channel');

    const userTimezone = main_interaction.options.getString('timezone') || 'Europe/Berlin';

    const timerApi = new Timer();

    if (type === 'stop') {
        timerApi.destroy(main_interaction.guild.id);
        return main_interaction.reply({ content: 'Timer stopped!', ephemeral: true });
    }

    const guildHasTimer = await timerApi.get(main_interaction.guild.id);
    if (guildHasTimer) {
        return main_interaction.reply({
            content: 'You already have a timer running! Delete it to add a new one.',
            ephemeral: true,
        });
    }

    const dateObject = new Date(date);
    if (dateObject.toString() === 'Invalid Date') {
        return main_interaction.reply({
            content: 'Please enter a valid date! (DD.MM.YYYY)',
            ephemeral: true,
        });
    }

    if (time.includes(':') === false || time.split(':').length !== 2) {
        return main_interaction.reply({
            content: 'Please enter a valid time! (HH:MM)',
            ephemeral: true,
        });
    }

    const dateArray = date.split('.');
    const day = dateArray[0];
    const month = dateArray[1];
    const year = dateArray[2];

    const newDate = new Date(`${year}-${month}-${day}T${time}`);
    const fullTimeObject = await timerApi.convertTimeZone(newDate, userTimezone);

    if (fullTimeObject.getTime() < new Date().getTime()) {
        return main_interaction.reply({
            content: 'The timer cannot end in the past!',
            ephemeral: true,
        });
    }

    const timeDifference = fullTimeObject.getTime() - new Date().getTime();
    const days = Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDifference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDifference % (1000 * 60 * 60)) / (1000 * 60));

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
                    ends_at: fullTimeObject.getTime(),
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

module.exports.data = timerConfig;

module.exports.autocomplete = async (interaction) => {
    const focusedOption = interaction.options.getFocused(true);
    const filtered = new Timer()
        .getTimezoneList()
        .filter((choice) => choice.startsWith(focusedOption.value));
    const slicedFiltered = filtered.slice(0, 25);
    await interaction.respond(slicedFiltered.map((choice) => ({ name: choice, value: choice })));
};
