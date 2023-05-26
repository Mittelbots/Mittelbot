const HangmanLogic = require('./HangmanLogic');
const { gamesConfig } = require('../games.config');
const { EmbedBuilder } = require('discord.js');

class Hangman extends HangmanLogic {
    constructor(interaction = null, bot) {
        super(interaction, bot);
        this.bot = bot;
        this.interaction = interaction;
    }

    createConfig(word) {
        const config = {
            ...gamesConfig.hangman.defaultConfig,
            word,
            host: this.interaction.user.id,
        };
        return Promise.resolve(config);
    }

    generateEmbedFields(game) {
        const { word, falsyGuessedLetters, guessedLetters } = game.config;

        let wordString = '';
        for (let i = 0; i < word.length; i++) {
            const letter = word[i];
            wordString += guessedLetters.includes(letter) ? letter : '_ ';
        }

        const fields = [
            { name: 'Word', value: `\`${wordString}\``, inline: true },
            { name: 'Lives', value: `\`${game.config.lives}\``, inline: true },
            {
                name: 'Guessed Letters',
                value: `\`${guessedLetters.join(', ') || 'None'}\``,
                inline: true,
            },
            {
                name: 'Falsy Guessed Letters',
                value: `\`${falsyGuessedLetters.join(', ') || 'None'}\``,
                inline: true,
            },
            {
                name: 'Host',
                value: `<@${game.config.host}>`,
            },
        ];

        return fields;
    }

    handleMessage(message) {
        return new Promise(async (resolve) => {
            const messageContent = message.content.toLowerCase();
            const game = await this.get(message.channel.id);
            if (!game) return resolve(404);

            const { word, guessedLetters, falsyGuessedLetters, host } = game.config;

            //if (message.author.id === host) {
            //return resolve(403);
            //}

            let wrongGuess = false;
            let response = '';
            let gameEnded = false;

            if (messageContent.length > 1) {
                if (messageContent === word) {
                    await this.delete(message.channel.id);
                } else {
                    game.config.lives--;
                    wrongGuess = true;
                }
            } else {
                if (
                    guessedLetters.includes(messageContent) ||
                    falsyGuessedLetters.includes(messageContent) ||
                    !word.includes(messageContent)
                ) {
                    game.config.lives--;
                    wrongGuess = true;
                } else {
                    game.config.guessedLetters.push(messageContent);
                    if (
                        game.config.guessedLetters.length === word.length ||
                        word === messageContent
                    ) {
                        response = 'You have guessed the word!';
                        gameEnded = true;
                    }
                }
            }

            if (game.config.guessedLetters.length === word.length || word === messageContent) {
                this.delete(message.channel.id);
                response = 'You have guessed the word!';
                gameEnded = true;
            }

            if (!gameEnded) {
                if (wrongGuess) {
                    if (game.config.lives === 0) {
                        await this.delete(message.channel.id);
                        response = `You lost! The word was \`${word}\``;
                        gameEnded = true;
                    } else {
                        falsyGuessedLetters.push(messageContent);
                        await this.update(game.config, message.channel.id);
                        response = 'That letter or word is not in the word!';
                    }
                } else {
                    game.config.guessedLetters.push(messageContent);
                    await this.update(game.config, message.channel.id);
                    response = 'That letter is in the word!';
                }
            }

            this.updateEmbed(game, response, gameEnded);
            resolve(200);
        });
    }

    updateEmbed(game, message = '', gameEnded = false) {
        const fields = this.generateEmbedFields(game);
        const embed = new EmbedBuilder().addFields(fields);

        if (gameEnded) {
            embed.setDescription(message);
        }

        this.bot.channels.cache
            .get(game.channel_id)
            .messages.fetch(game.config.message_id)
            .then((msg) => {
                msg.edit({
                    content: message,
                    embeds: [embed],
                });
            });
    }
}

module.exports = Hangman;
