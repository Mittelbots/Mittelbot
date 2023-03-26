const defaultTranslations = require('../../../src/assets/json/translations/_default.json');

module.exports = class Translations {
    constructor() {}

    #defaultLanguage = 'en_EN';
    #supportedLanguages = ['en_EN'];

    #selectedLanguage = this.#defaultLanguage;
    #translationFile;

    /**
     *
     * @param {Array} key
     * @param {*} guild_id
     * @returns
     */
    trans(key, guild_id = null) {
        if (!key) return null;

        this.guild_id = guild_id;
        //if(!this.#isLanguageSupported()) return null; // FUTURE FEATURE
        this.#getTranslationFile(this.#selectedLanguage);

        const searchKey = key[0];
        const searchValue = key.splice(1, 1);

        const translation = this.#getTranslation(searchKey);
        if (!translation) return null;

        let newString = this.#processCustomStrings(translation, searchValue);

        if (searchValue.length > 0) {
            newString = this.processCustomValues(newString, searchValue);
        }

        return newString;
    }

    #processCustomStrings(string, searchValue) {
        if (!string) return null;

        const regex = /{([^}]+)}/g;
        const matches = string.match(regex);
        if (!matches) return string;

        matches.forEach((match) => {
            const variable = match.replace('{', '').replace('}', '');
            const value = this.#getTranslation(variable);
            string = string.replace(match, value);
        });

        return string;
    }

    processCustomValues(string, searchValue) {
        if (!string) return null;
        const stringArray = string.split(' ');
        stringArray.forEach((word, index) => {
            const regex = /%([a-zA-Z])/g;
            const matches = word.match(regex);
            if (!matches) return;

            word.replace(matches[0], searchValue);
            stringArray[index] = word;
        });
        string = stringArray.join(' ');
        return string;
    }

    #getTranslation(key) {
        if (!key) return null;

        const keyArray = key.split('.');
        let translation = this.#translationFile;

        keyArray.forEach((key) => {
            translation = translation[key];
        });

        return translation;
    }

    #isLanguageSupported(language) {
        return this.#supportedLanguages.includes(language);
    }

    #getTranslationFile() {
        try {
            const file = require(`../../../src/assets/json/translations/${
                this.#selectedLanguage
            }.json`);
            this.#translationFile = file;
        } catch (e) {
            this.#translationFile = defaultTranslations;
        }
    }
};
