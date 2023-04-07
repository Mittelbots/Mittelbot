const { AttachmentBuilder, EmbedBuilder } = require('discord.js');

const axios = require('axios');
const { catsConfig } = require('../_config/fun/cats');

module.exports.run = async ({ main_interaction, bot }) => {
    await main_interaction.deferReply();

    const { data } = await axios.get(`https://api.thecatapi.com/v1/images/search?limit=1`);

    return main_interaction
        .followUp({
            files: [new AttachmentBuilder(data[0].url, 'cat.png')],
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

module.exports.data = catsConfig;
