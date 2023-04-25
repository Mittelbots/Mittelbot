const { SlashCommandBuilder } = require('discord.js');

module.exports.imgurConfig = new SlashCommandBuilder()
    .setName('imgur')
    .setDescription('Upload your images to imgur')
    .addStringOption((option) =>
        option
            .setName('image')
            .setDescription('The image you want to upload (Discord attachment link)')
            .setRequired(true)
    )
    .addStringOption((option) =>
        option.setName('title').setDescription('The title of the image').setRequired(false)
    )
    .addStringOption((option) =>
        option
            .setName('description')
            .setDescription('The description of the image')
            .setRequired(false)
    );
