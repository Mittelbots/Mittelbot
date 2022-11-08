const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');

const axios = require('axios');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply();

    const { data } = await axios.get(`https://api.thecatapi.com/v1/images/search?limit=1`);

    return main_interaction
        .followUp({
            files: [new AttachmentBuilder(data[0].url, 'cat.png')],
        })
        .catch((err) => {
            main_interaction.reply('❌ Something went wrong!').catch((err) => {});
        });
};

module.exports.data = new SlashCommandBuilder()
    .setName('cats')
    .setDescription('Get pics of Cats. THE PURE CUTENESS!!!');
