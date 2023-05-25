const HangmanLogic = require('./HangmanLogic');
const { gamesConfig } = require('../games.config');

module.exports = class Hangman extends HangmanLogic {
    constructor(interaction) {
        super(interaction);
        this.interaction = interaction;
    }

    createConfig(word) {
        return new Promise(async (resolve, reject) => {
            const config = gamesConfig['hangman'].defaultConfig;
            config.word = word;
            resolve(config);
        });
    }

    generateEmbedFields(game) {
        const word = game.config.word;
        const falsyGuessedLetters = game.config.falsyGuessedLetters;
        const guessedLetters = game.config.guessedLetters;

        let wordString = '';
        for (let i = 0; i < word.length; i++) {
            const letter = word[i];
            if (guessedLetters.includes(letter)) {
                wordString += letter;
            } else {
                wordString += '_ ';
            }
        }

        const fields = [
            {
                name: 'Word',
                value: `\`${wordString}\``,
                inline: true,
            },
            {
                name: 'Lives',
                value: `\`${game.config.lives}\``,
                inline: true,
            },
            {
                name: 'Guessed Letters',
                value: `\`${guessedLetters.join(', ') | 'None'}\``,
                inline: true,
            },
            {
                name: 'Falsy Guessed Letters',
                value: `\`${falsyGuessedLetters.join(', ') | 'None'}\``,
                inline: true,
            },
        ];

        return fields;
    }
};
