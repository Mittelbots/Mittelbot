const { AttachmentBuilder } = require('discord.js');
const animals = require('random-animals-api');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const { dogsConfig } = require('../_config/fun/dogs');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply();

    animals
        .dog()
        .then((url) => {
            return main_interaction
                .followUp({
                    files: [new AttachmentBuilder(url, 'dog.png')],
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

module.exports.data = dogsConfig;
