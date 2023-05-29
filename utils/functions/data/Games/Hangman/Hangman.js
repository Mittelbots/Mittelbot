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
            if (this.cooldown(message.author.id, message.channel.id)) return resolve(429);

            const messageContent = message.content.toLowerCase();
            const game = await this.get(message.channel.id);
            if (!game) return resolve(404);

            let { word, guessedLetters, falsyGuessedLetters, host, lives } = game.config;

            //if (message.author.id === host) {
            //return resolve(403);
            //}

            let wrongGuess = false;
            let response = '';
            let gameEnded = false;

            if (messageContent.length > 1) {
                if (messageContent === word) {
                    await this.delete(message.channel.id);
                    gameEnded = true;
                    response = 'You have guessed the word!';
                } else {
                    lives--;
                    wrongGuess = true;
                }
            } else {
                if (
                    guessedLetters.includes(messageContent) ||
                    falsyGuessedLetters.includes(messageContent) ||
                    !word.includes(messageContent)
                ) {
                    lives--;
                    wrongGuess = true;
                } else {
                    !guessedLetters.includes(messageContent)
                        ? guessedLetters.push(messageContent)
                        : null;
                    if (this.hasGuessedTheWord(word, guessedLetters) || word === messageContent) {
                        response = 'You have guessed the word!';
                        gameEnded = true;
                    } else {
                        response = 'That letter is in the word!';
                    }
                }
            }

            if (this.hasGuessedTheWord(word, guessedLetters) || word === messageContent) {
                this.delete(message.channel.id);
                response = 'You have guessed the word!';
                gameEnded = true;
            } else {
                if (wrongGuess) {
                    if (lives <= 0) {
                        await this.delete(message.channel.id);
                        response = `You lost! The word was \`${word}\``;
                        gameEnded = true;
                    } else {
                        !falsyGuessedLetters.includes(messageContent)
                            ? falsyGuessedLetters.push(messageContent)
                            : null;
                        response = 'That letter or word is not in the word!';
                    }
                }
            }

            if (!gameEnded) {
                game.config.lives = lives;
                game.config.guessedLetters = guessedLetters;
                game.config.falsyGuessedLetters = falsyGuessedLetters;

                await this.update(game.config, message.channel.id);
            }

            this.updateEmbed(game, response, gameEnded, message.author, wrongGuess);
            resolve(200);
        });
    }

    updateEmbed(game, message = '', gameEnded = false, author, wasIncorrect = false) {
        const fields = this.generateEmbedFields(game);
        const embed = new EmbedBuilder().addFields(fields);

        if (gameEnded) {
            embed.setDescription(message);
            embed.setColor(global.t.trans(['general.colors.success']));
        } else {
            if (wasIncorrect) {
                global.t.trans(['general.colors.error']);
            } else {
                global.t.trans(['general.colors.info']);
            }
        }
        this.bot.channels.cache
            .get(game.channel_id)
            .messages.fetch(game.config.message_id)
            .then((msg) => {
                msg.edit({
                    content: `${author} ${message}`,
                    embeds: [embed],
                });
            });
    }

    hasGuessedTheWord(word, guessedLetters) {
        for (let i = 0; i < word.length; i++) {
            if (!guessedLetters.includes(word[i])) {
                return false;
            }
        }
        return true;
    }
}

module.exports = Hangman;
