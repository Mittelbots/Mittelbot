const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');

const url = 'https://stromberg-api.de/api/'

module.exports.run = async ({ main_interaction, bot }) => {
    const type = main_interaction.options.getString('type');

    const newEmbed = new EmbedBuilder();

    if (type === 'quotes') {
        const response = await axios.get(url+'quotes/random', {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const quote = await response.data;

        newEmbed.setTitle('Stromberg Quotes');

        if (!quote.quote) {
            return main_interaction
                .reply({
                    content: 'Something went wrong. Please try again later.',
                    ephemeral: true,
                })
                .catch((err) => {});
        }

        newEmbed.setDescription(quote.quote);
        newEmbed.addFields({
            name: '----------------------------------',
            value: '----------------------------------',
        });
        if (quote.character) {
            newEmbed.addFields({
                name: 'Gesprochen von:',
                value: quote.character.name,
                inline: true,
            });
            newEmbed.addFields({
                name: 'Alter: ',
                value: quote.character.age.toString(),
                inline: true,
            });
            newEmbed.addFields({
                name: 'Position: ',
                value: quote.character.position,
            });
            newEmbed.addFields({
                name: '----------------------------------',
                value: '----------------------------------',
            });
        }

        if (quote.episode) {
            newEmbed.addFields({
                name: 'Episode: ',
                value:
                    quote.episode.title +
                    ' (' +
                    quote.episode.season +
                    'x' +
                    quote.episode.episode +
                    ')',
            });
        }
        if (quote.created_at) {
            newEmbed.addFields({
                name: 'Erstellt am: ',
                value: new Date(quote.created_at).toLocaleDateString('de-DE'),
            });
        }
    } else if (type === 'characters') {
        const response = await axios.get(url+'characters/random');
        const character = response.data;

        if (!character.name) {
            return main_interaction
                .reply({
                    content: 'Something went wrong. Please try again later.',
                    ephemeral: true,
                })
                .catch((err) => {});
        }

        if (character.description.length > 1024) {
            character.description = character.description.substring(0, 1021) + '...';
        }

        newEmbed.setTitle(character.name);

        newEmbed.setDescription(character.description);
        newEmbed.addFields(
            {
                name: 'Alter: ',
                value: character.age.toString(),
                inline: true,
            },
            {
                name: 'Position: ',
                value: character.position,
            },
            {
                name: 'Gespielt von: ',
                value: character.played_by,
            }
        );

        if (character.picture) {
            newEmbed.setImage(character.picture);
        }
    }

    await main_interaction
        .reply({
            embeds: [newEmbed],
        })
        .catch((err) => {
            main_interaction
                .reply({
                    content: 'Something went wrong. Please try again later.',
                    ephemeral: true,
                })
                .catch((err) => {});
        });
};

module.exports.data = new SlashCommandBuilder()
    .setName('stromberg')
    .setDescription('Get a random stromberg quote or a character.')
    .addStringOption((option) =>
        option
            .setName('type')
            .setDescription('Select a type.')
            .setRequired(true)
            .addChoices({
                name: 'Quotes',
                value: 'quotes',
            })
            .addChoices({
                name: 'Characters',
                value: 'characters',
            })
    );
