const HangmanLogic = require("./HangmanLogic");

module.exports = class Hangman extends HangmanLogic {
    constructor(interaction) {
        this.interaction = interaction;
    }
}