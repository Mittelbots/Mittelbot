const { SlashCommandBuilder, AttachmentBuilder } = require("discord.js");

const axios = require('axios');

module.exports.run = async ({main_interaction, bot}) => {
    await main_interaction.deferReply();

    const { data } = await axios.get(`https://api.thecatapi.com/v1/images/search?limit=1`);

<<<<<<< HEAD
    return main_interaction
        .followUp({
            files: [new AttachmentBuilder(data[0].url, 'cat.png')],
        })
        .catch((err) => {
            main_interaction.reply('❌ Something went wrong!').catch((err) => {});
        });
};
=======
    return main_interaction.followUp({
        files: [new AttachmentBuilder(data[0].url, 'cat.png')]
    }).catch(err => {
        console.log(err)
        main_interaction.reply('Something went wrong!').catch(err => {});
    });
}
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f

module.exports.data = new SlashCommandBuilder()
	.setName('cats')
	.setDescription('Get pics of Cats. THE PURE CUTENESS!!!')