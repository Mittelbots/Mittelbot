const HangmanLogic = require('./HangmanLogic');
const { gamesConfig } = require('../games.config');

class Hangman extends HangmanLogic {
    constructor(interaction) {
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
}

module.exports = Hangman;
