const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");

const axios = require('axios');

module.exports.run = async ({main_interaction, bot}) => {
    const { data } = await axios.get(`https://dog.ceo/api/breeds/image/random`);
    if(data.status === 'success'){
        return main_interaction.reply({
            files: [new AttachmentBuilder(data.message, 'dog.png')]
        }).catch(err => {});
    }else {
        return main_interaction.reply('Something went wrong!').catch(err => {});
    }
}

module.exports.data = new SlashCommandBuilder()
	.setName('dogs')
	.setDescription('Get pics of dogs. THE PURE CUTENESS!!!')