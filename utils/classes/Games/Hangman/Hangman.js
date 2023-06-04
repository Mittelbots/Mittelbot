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
        const { word, falsyGuessedLetters, guessedLetters, guild_id } = game.config;

        let wordString = '';
        for (let i = 0; i < word.length; i++) {
            const letter = word[i];
            wordString += guessedLetters.includes(letter) ? letter : '_ ';
        }

        const fields = [
            {
                name: global.t.trans(['info.fun.hangman.embed.fields.word'], guild_id),
                value: `\`${wordString}\``,
                inline: true,
            },
            {
                name: global.t.trans(['info.fun.hangman.embed.fields.lives'], guild_id),
                value: `\`${game.config.lives}\``,
                inline: true,
            },
            {
                name: global.t.trans(['info.fun.hangman.embed.fields.guessedLetters'], guild_id),
                value: `\`${guessedLetters.join(', ') || 'None'}\``,
                inline: true,
            },
            {
                name: global.t.trans(
                    ['info.fun.hangman.embed.fields.falsyGuessedLetters'],
                    guild_id
                ),
                value: `\`${falsyGuessedLetters.join(', ') || 'None'}\``,
                inline: true,
            },
            {
                name: global.t.trans(['info.fun.hangman.embed.fields.host'], guild_id),
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

            if (this.cooldown(message.author.id, message.channel.id)) return resolve(429);

            let { word, guessedLetters, falsyGuessedLetters, host, lives } = game.config;

            if (message.author.id === host) {
                return resolve(403);
            }

            let wrongGuess = false;
            let response = '';
            let gameEnded = false;

            if (messageContent.length > 1) {
                if (messageContent === word) {
                    await this.delete(message.channel.id);
                    gameEnded = true;
                    response = global.t.trans(
                        ['info.fun.hangman.guessedWord', message.author, word],
                        message.guild.id
                    );
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
                    response = global.t.trans(
                        ['info.fun.hangman.guessedLetter', message.author, messageContent],
                        message.guild.id
                    );
                }
            }

            if (this.hasGuessedTheWord(word, guessedLetters) || word === messageContent) {
                this.delete(message.channel.id);
                response = global.t.trans(
                    ['info.fun.hangman.guessedWord', message.author, messageContent],
                    message.guild.id
                );
                gameEnded = true;
            } else {
                if (wrongGuess) {
                    if (lives <= 0) {
                        await this.delete(message.channel.id);
                        response = global.t.trans(
                            ['info.fun.hangman.gameOver', message.author, word],
                            message.guild.id
                        );
                        gameEnded = true;
                    } else {
                        !falsyGuessedLetters.includes(messageContent)
                            ? falsyGuessedLetters.push(messageContent)
                            : null;
                        response = global.t.trans(
                            ['info.fun.hangman.falsyGuessed', message.author, messageContent],
                            message.guild.id
                        );
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
                    content: message,
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

    cancel() {
        return new Promise(async (resolve) => {
            const game = await this.get(this.interaction.channel.id);
            if (!game || game.config.host !== this.interaction.user.id) {
                this.interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setDescription(
                                global.t.trans(
                                    ['error.fun.hangman.notCancelled'],
                                    this.interaction.guild.id
                                )
                            )
                            .setColor(global.t.trans(['general.colors.error'])),
                    ],
                    ephemeral: true,
                });
                return resolve();
            }

            await this.delete(this.interaction.channel.id);
            this.interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription(
                            global.t.trans(
                                [
                                    'success.fun.hangman.cancelled',
                                    this.interaction.guild,
                                    this.interaction.channel,
                                ],
                                this.interaction.guild.id
                            )
                        )
                        .setColor(global.t.trans(['general.colors.success'])),
                ],
                ephemeral: true,
            });
            this.interaction.message.delete().catch(() => {});
            resolve();
        });
    }
}

module.exports = Hangman;
