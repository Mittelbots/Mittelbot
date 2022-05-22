const { SlashCommandBuilder } = require("@discordjs/builders");
const { MessageAttachment } = require("discord.js");

const axios = require('axios');

module.exports.run = async ({main_interaction, bot}) => {
    const { data } = await axios.get(`https://api.thecatapi.com/v1/images/search?limit=1`);

    return main_interaction.reply({
        files: [new MessageAttachment(data[0].url, 'cat.png')]
    })
}

module.exports.data = new SlashCommandBuilder()
	.setName('cats')
	.setDescription('Get pics of Cats. THE PURE CUTENESS!!!')