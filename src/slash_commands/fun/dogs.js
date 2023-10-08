const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const animals = require('random-animals-api');
const { errorhandler } = require('~utils/functions/errorhandler/errorhandler');
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
                .catch(() => {});
        })
        .catch((err) => {
            errorhandler({ err });
            main_interaction
                .followUp({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(
                                    ['error.generalWithMessage', err.message],
                                    main_interaction.guild.id
                                )
                            )
                            .setColor(global.t.trans(['general.colors.error'])),
                    ],
                    ephemeral: true,
                })
                .catch(() => {});
        });
};

module.exports.data = dogsConfig;
