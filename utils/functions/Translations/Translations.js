const defaultTranslations = require('../../../src/assets/json/translations/_default.json');
const guildConfig = require('../../../src/db/Models/tables/guildConfig.model');
const { GuildConfig } = require('../data/Config');
const { errorhandler } = require('../errorhandler/errorhandler');

module.exports = class Translations {
    constructor() {
        this.#init();
    }

    #cache = new Map();
    #defaultLanguage = 'en_EN';
    #supportedLanguages = ['en_EN', 'de_DE'];

    #selectedLanguage = this.#defaultLanguage;
    #translationFile;

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
        if (!this.#isLanguageSupported(selectedLanguage)) return null; // FUTURE FEATURE
        this.#getTranslationFile(selectedLanguage);

        const searchKey = key[0];
        const translation = this.#getTranslation(searchKey);
        if (!translation) return null;

        const searchValue = key.splice(1, key.length - 1);
        let newString = this.#processCustomStrings(translation, searchValue);

        if (searchValue.length > 0) {
            newString = this.processCustomValues(newString, searchValue);
        }

        return newString;
    }

    #processCustomStrings(string, searchValue) {
        if (!string) return null;
        if (typeof string !== 'string') return string;

        const regex = /{([^{}]+)(?=[^{}]*})}/; // eslint-disable-line
        const matches = string.match(regex);
        if (!matches) return string;

        matches.forEach((match) => {
            const variable = match.replace('{', '').replace('}', '');
            const value = this.#getTranslation(variable);
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

    #getTranslation(key) {
        if (!key) return null;

        const keyArray = key.split('.');
        let translation = this.#translationFile;

        try {
            keyArray.forEach((key) => {
                translation = translation[key];
            });
        } catch (e) {
            return 'Translation not found';
        }

        return translation || 'Translation not found';
    }

    #isLanguageSupported(language) {
        return this.#supportedLanguages.includes(language);
    }

    #getTranslationFile(language) {
        try {
            this.#translationFile = require(`../../../src/assets/json/translations/${language}.json`);
        } catch (e) {
            this.#translationFile = defaultTranslations;
        }
    }

    #getGuildLanguage(guild_id) {
        if (!guild_id) return this.#defaultLanguage;

        const language = this.#cache.get(guild_id);
        if (!language) return this.#defaultLanguage;

        return language;
    }
};
