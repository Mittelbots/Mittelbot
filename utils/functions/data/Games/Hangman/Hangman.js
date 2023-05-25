const HangmanLogic = require('./HangmanLogic');
const { gamesConfig } = require('../games.config');

class Hangman extends HangmanLogic {
    constructor(interaction = null) {
        super(interaction);
        this.interaction = interaction;
    }

    createConfig(word) {
        const config = { ...gamesConfig.hangman.defaultConfig, word };
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
        ];

        return fields;
    }

    handleMessage(message) {
        return new Promise(async (resolve) => {
            const messageContent = message.content.toLowerCase();
            const game = await this.get(message.channel.id);
            if (!game) return resolve();

            const { word, guessedLetters, falsyGuessedLetters } = game.config;

            let wrongGuess = false;

            if (messageContent.length > 1 && messageContent !== word) {
                game.config.lives--;
                wrongGuess = true;
            } else if (messageContent.length > 1 && messageContent === word) {
                await this.delete(message.channel.id);
            } else if (guessedLetters.includes(messageContent)) {
                game.config.lives--;
                wrongGuess = true;
            } else if (falsyGuessedLetters.includes(messageContent)) {
                game.config.lives--;
                wrongGuess = true;
            } else if (!word.includes(messageContent)) {
                game.config.falsyGuessedLetters.push(messageContent);
                game.config.lives--;
                wrongGuess = true;
            }

            if (wrongGuess && game.config.lives === 0) {
                await this.delete(message.channel.id);
                return resolve(`You lost! The word was \`${word}\``);
            } else if (wrongGuess) {
                await this.update(game.config, message.channel.id);
                return resolve('That letter or word is not in the word!');
            } else {
                game.config.guessedLetters.push(messageContent);

                if (game.config.guessedLetters.length === word.length || word === messageContent) {
                    return resolve('You have guessed the word!');
                }

                game.config.guessedLetters.push(messageContent);
                await this.update(game.config, message.channel.id);

                return resolve('That letter is in the word!');
            }
        });
    }
}

module.exports = Hangman;
