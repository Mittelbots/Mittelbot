const { EmbedBuilder } = require('discord.js');
const { guessnumberConfig } = require('../_config/fun/guessnumber');
const { isAlphanumeric } = require('validator');

module.exports.run = async ({ main_interaction, bot }) => {
    const maxNumber = Math.floor(Math.random() * 100) + 1;

    await main_interaction
        .reply({
            embeds: [
                new EmbedBuilder()
                    .setDescription(
                        global.t.trans(
                            ['info.fun.guessnumber.guess', maxNumber],
                            main_interaction.guild.id
                        )
                    )
                    .setColor(global.t.trans(['general.colors.info'])),
            ],
        })
        .catch((err) => {});

    const originalNumber = () => {
        let number = Math.floor(Math.random() * 99) + 1;
        if (number === 0 || number === 1) return originalNumber();
        if (number <= maxNumber) {
            return number;
        } else {
            return originalNumber();
        }
    };

    const message_collector = await main_interaction.channel.createMessageCollector({
        max: 1,
        time: 10000,
        filter: (m) => m.author.id === main_interaction.user.id,
    });

    const number = originalNumber();
    await message_collector.on('collect', async (message) => {
        if (!isAlphanumeric(message.content)) {
            await message
                .reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(
                                    ['error.input.invalidNumber', number],
                                    main_interaction.guild.id
                                )
                            )
                            .setColor(global.t.trans(['general.colors.error'])),
                    ],
                })
                .catch((err) => {});
        }

        const guess = parseInt(message.content, 10);

        if (guess === number) {
            await message.reply(`✅ You guessed the number! It was ${number}`).catch((err) => {});
            message_collector.stop();
        } else if (guess > number) {
            await message
                .reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(
                                    ['error.fun.guessnumber.tooLowOrHigh', 'high', number],
                                    main_interaction.guild.id
                                )
                            )
                            .setColor(global.t.trans(['general.colors.error'])),
                    ],
                })
                .catch((err) => {});
        } else if (guess < number) {
            await message
                .reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(
                                    ['error.fun.guessnumber.tooLowOrHigh', 'low', number],
                                    main_interaction.guild.id
                                )
                            )
                            .setColor(global.t.trans(['general.colors.error'])),
                    ],
                })
                .catch((err) => {});
        }
    });

    await message_collector.on('end', async (reason) => {
        if (reason === 'time') {
            await main_interaction.channel
                .send({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(
                                    ['error.fun.guessnumber.haventguessed', number],
                                    main_interaction.guild.id
                                )
                            )
                            .setColor(global.t.trans(['general.colors.error'])),
                    ],
                })
                .catch((err) => {});
        }
    });
};

module.exports.data = guessnumberConfig;
