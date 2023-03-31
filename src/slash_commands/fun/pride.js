const { EmbedBuilder } = require('discord.js');

const genders = require('../../../utils/data/pride/gender/');
const sexualities = require('../../../utils/data/pride/sexualities/');
const { prideConfig } = require('../_config/fun/pride');

module.exports.run = async ({ main_interaction, bot }) => {
    const type = main_interaction.options.getString('type');
    const newEmbed = new EmbedBuilder();

    if (type === 'gender') {
        const getRandomGender = () => {
            return genders[Math.floor(Math.random() * genders.length)];
        };

        const newGender = getRandomGender();

        newEmbed.setTitle(`Gender: ${newGender.name}`);
        newEmbed.setDescription(newGender.description);
        newEmbed.addFields({
            name: 'Similar to: ',
            value: newGender.differentFrom.join(', '),
        });

        newEmbed.addFields({
            name: 'Try again by clicking',
            value: `</pride:${main_interaction.commandId}>`,
        });
        newEmbed.setImage(newGender.flag);
    } else if (type === 'sexuality') {
        const getRandomSexuality = () => {
            return sexualities[Math.floor(Math.random() * sexualities.length)];
        };

        const newSexuality = getRandomSexuality();

        newEmbed.setTitle(`Sexuality: ${newSexuality.name}`);
        newEmbed.setDescription(newSexuality.description);
        newEmbed.addFields(
            {
                name: 'Genders:',
                value: newSexuality.gender.join(', '),
            },
            {
                name: 'Attracted to:',
                value: newSexuality.attractedTo.join(', '),
            },
            {
                name: 'Attraction Type:',
                value: newSexuality.attractionType,
            },
            {
                name: 'Similar to: ',
                value: newSexuality.differentFrom.join(', '),
            },
            {
                name: 'Try again by clicking',
                value: `</pride:${main_interaction.commandId}>`,
            }
        );
        newEmbed.setImage(newSexuality.flag);
    }

    return main_interaction
        .reply({
            embeds: [newEmbed],
        })
        .catch((err) => {
            return main_interaction
                .reply({
                    content: 'Something went wrong!',
                    ephemeral: true,
                })
                .catch((err) => {});
        });
};

module.exports.data = prideConfig;
