const {
    SlashCommandBuilder,
    AttachmentBuilder
} = require("discord.js");
const animals = require('random-animals-api');

module.exports.run = async ({
    main_interaction,
    bot
}) => {
    animals.bunny()
        .then(url => {
            return main_interaction.reply({
                files: [new AttachmentBuilder(url, 'bunny.png')]
            }).catch(err => {});
        })
        .catch((error) => {
            main_interaction.reply({
                content:'Something went wrong!',
                ephemeral: true
            }).catch(err => {});
        });
}

module.exports.data = new SlashCommandBuilder()
    .setName('bunny')
    .setDescription('Get pics of Bunnys. THE PURE CUTENESS!!!')