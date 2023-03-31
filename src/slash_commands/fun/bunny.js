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
        .catch((err) => {
            errorhandler({
                err: {
                    message: err.message,
                    stack: err.stack,
                },
                fatal: true,
            });
            main_interaction
                .followUp({
                    content: global.t.trans(
                        ['error.generalWithMessage', err.message],
                        main_interaction.guild.id
                    ),
                    ephemeral: true,
                })
                .catch((err) => {});
        });
};

module.exports.data = new SlashCommandBuilder()
    .setName('bunny')
    .setDescription('Get pics of Bunnys. THE PURE CUTENESS!!!');
