const { AttachmentBuilder, EmbedBuilder } = require('discord.js');
const animals = require('random-animals-api');
const { errorhandler } = require('~utils/functions/errorhandler/errorhandler');
const { bunnyConfig } = require('../_config/fun/bunny');

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
                .catch((err) => {});
        });
};

module.exports.data = bunnyConfig;
