const axios = require('axios');
const { EmbedBuilder } = require('discord.js');
const { SlashCommandBuilder } = require('discord.js');
const { strombergConfig } = require('../_config/fun/stromberg');

const url = 'https://www.stromberg-api.de/api/';

module.exports.run = async ({ main_interaction, bot }) => {
    const type = main_interaction.options.getString('type');

    const newEmbed = new EmbedBuilder();

    if (type === 'quotes') {
        const response = await axios.get(url + 'quotes/random', {
            headers: {
                'Content-Type': 'application/json',
            },
        });
        const quote = await response.data;

        newEmbed.setTitle('Stromberg Quotes');

        if (!quote.quote) {
            return main_interaction
                .reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(['error.general'], main_interaction.guild.id)
                            )
                            .setColor(global.t.trans(['general.colors.error'])),
                    ],
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
                name: global.t.trans(['info.fun.stromberg.spokenof'], main_interaction.guild.id),
                value: quote.character.name,
                inline: true,
            });
            newEmbed.addFields({
                name: global.t.trans(['info.fun.stromberg.age'], main_interaction.guild.id),
                value: quote.character.age.toString(),
                inline: true,
            });
            newEmbed.addFields({
                name: global.t.trans(['info.fun.stromberg.position'], main_interaction.guild.id),
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
                name: global.t.trans(['info.fun.stromberg.createdAt'], main_interaction.guild.id),
                value: new Date(quote.created_at).toLocaleDateString('de-DE'),
            });
        }
    } else if (type === 'characters') {
        const response = await axios.get(url + 'characters/random');
        const character = response.data;

        if (!character.name) {
            return main_interaction
                .reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(['error.general'], main_interaction.guild.id)
                            )
                            .setColor(global.t.trans(['general.colors.error'])),
                    ],
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
                name: global.t.trans(['info.fun.stromberg.age'], main_interaction.guild.id),
                value: character.age.toString(),
                inline: true,
            },
            {
                name: global.t.trans(['info.fun.stromberg.position'], main_interaction.guild.id),
                value: character.position,
            },
            {
                name: global.t.trans(['info.fun.stromberg.playedBy'], main_interaction.guild.id),
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
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(['error.general'], main_interaction.guild.id)
                            )
                            .setColor(global.t.trans(['general.colors.error'])),
                    ],
                    ephemeral: true,
                })
                .catch((err) => {});
        });
};

module.exports.data = strombergConfig;
