const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports.run = async ({ main_interaction, bot }) => {
    const options = main_interaction.options.getString('options');

    const newEmbed = new EmbedBuilder()
        .setColor('#0099ff')

        .setImage(json.url)
        .setTimestamp();

    const API_URL = 'https://pride-api.herokuapp.com/api/';

    const response = await fetch(API_URL + options);
    const json = await response.json();

    console.log(json);

    if (!json) return main_interaction.reply({ content: 'Something went wrong!', ephemeral: true });

    switch (options) {
        case 'gender':
    }

    return main_interaction.reply({
        embeds: [newEmbed],
    });
};

module.exports.data = new SlashCommandBuilder()
    .setName('pride')
    .setDescription('Get informations about the super cool pride family')
    .addStringOption((option) =>
        option
            .setName('options')
            .setDescription('Select an option to get more information')
            .setRequired(true)
            .addChoices({
                name: 'Get all genders',
                value: 'gender',
            })
    );
