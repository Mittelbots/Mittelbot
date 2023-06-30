const defaultTranslations = require('~assets/json/translations/en_US/en_US.json');
const guildConfig = require('~src/db/Models/guildConfig.model');
const { errorhandler } = require('~utils/functions/errorhandler/errorhandler');

module.exports = class Translations {
    constructor() {
        this.#init();
    }

    #cache = new Map();
    #defaultLanguage = 'en_US';
    #supportedLanguages = ['en_US', 'de_DE', 'hu_HU', 'pl_PL'];

    translationTries = 0;

    #init() {
        return new Promise(async (resolve) => {
            await guildConfig
                .findAll()
                .then((guildConfigs) => {
                    guildConfigs.forEach((guildConfig) => {
                        this.#cache.set(guildConfig.guild_id, guildConfig.lang);
                    });
                })
                .catch((err) => {
                    errorhandler({ err });
                });
            resolve();
        });
    }

    /**
     *
     * @param {Array} key
     * @param {Number} guild_id
     * @returns
     */
    trans(key, guild_id = null) {
        if (!key) return null;

        this.guild_id = guild_id;

        const selectedLanguage = this.#getGuildLanguage(guild_id);
        if (!this.#isLanguageSupported(selectedLanguage)) return null;
        const file = this.#getTranslationFile(selectedLanguage);

        const searchKey = key[0];
        const translation = this.#getTranslation(searchKey, file);
        if (!translation) return null;

        const searchValue = key.splice(1, key.length - 1);
        let newString = this.#processCustomStrings(translation, searchValue, file);
        if (searchValue.length > 0) {
            newString = this.processCustomValues(newString, searchValue);
        }

        return newString;
    }

    #processCustomStrings(string, searchValue, file) {
        if (!string) return null;
        if (typeof string !== 'string') return string;

        const regex = /{([^{}]+)(?=[^{}]*})}/; // eslint-disable-line
        const matches = string.match(regex);
        if (!matches) return string;

        matches.forEach((match) => {
            const variable = match.replace('{', '').replace('}', '');
            const value = this.#getTranslation(variable, file);
            string = string.replace(match, value);
        });
        if (string.match(regex)) {
            return this.#processCustomStrings(string, searchValue);
        }
        return string;
    }

    processCustomValues(string, values) {
        if (!string) return null;
        if (typeof string !== 'string') return string;

        const regex = /(%[a-z])/;

        const stringArray = string.split(regex);

        let valueIndex = 0;
        for (let i in stringArray) {
            if (stringArray[i].match(regex)) {
                stringArray[i] = stringArray[i].replace(stringArray[i], values[valueIndex]);
                valueIndex++;
            }
        }

        string = stringArray.join('');
        return string;
    }

    #getTranslation(key, file) {
        if (!key) return null;

        const keyArray = key.split('.');
        let translation = file;
        try {
            keyArray.forEach((key) => {
                translation = translation[key];
            });
        } catch (e) {
            // translation not found
        }

        if (!translation && this.translationTries === 0) {
            this.translationTries++;
            return this.#getTranslation(key, defaultTranslations);
        }
        this.translationTries = 0;
        return translation || 'Translation not found';
    }

    #isLanguageSupported(language) {
        return this.#supportedLanguages.includes(language);
    }

    #getTranslationFile(language) {
        try {
            return require(`~assets/json/translations/${language}/${language}.json`);
        } catch (e) {
            return defaultTranslations;
        }
    }

    #getGuildLanguage(guild_id) {
        if (!guild_id) return this.#defaultLanguage;

        const language = this.#cache.get(guild_id);
        if (!language) return this.#defaultLanguage;

        return language;
    }

    updateCache(guild_id, lang) {
        this.#cache.set(guild_id, lang);
    }
};
