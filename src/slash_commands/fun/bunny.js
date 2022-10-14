const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const animals = require('random-animals-api');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply();

    animals
        .bunny()
        .then((url) => {
            return main_interaction
                .followUp({
                    files: [new AttachmentBuilder(url, 'bunny.png')],
                })
                .catch((err) => {});
        })
        .catch((error) => {
            errorhandler({ err, fatal: true });
            main_interaction
                .followUp({
                    content: 'Something went wrong!',
                    ephemeral: true,
                })
                .catch((err) => {});
        });
};

module.exports.data = new SlashCommandBuilder()
    .setName('bunny')
    .setDescription('Get pics of Bunnys. THE PURE CUTENESS!!!');
