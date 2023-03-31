const { SlashCommandBuilder } = require('discord.js');

module.exports.autoTranslateConfig = new SlashCommandBuilder()
    .setName('autotranslate')
    .setDescription('Translate messages from one language to another into a given Channel.')
    .addChannelOption((channel) =>
        channel
            .setName('target')
            .setDescription('The channel where the messages will be translated.')
            .setRequired(true)
    )
    .addChannelOption((channel) =>
        channel
            .setName('log')
            .setDescription('The channel where the translated messages will be logged.')
            .setRequired(true)
    )
    .addStringOption((option) =>
        option
            .setName('language')
            .setDescription('Select a language to translate to.')
            .addChoices({
                name: 'auto',
                value: 'auto',
            })
            .addChoices({
                name: 'Afrikaans',
                value: 'af',
            })
            .addChoices({
                name: 'Arabic',
                value: 'ar',
            })
            .addChoices({
                name: 'Azerbaijani',
                value: 'az',
            })
            .addChoices({
                name: 'Bosnian',
                value: 'bs',
            })
            .addChoices({
                name: 'Bulgarian',
                value: 'bg',
            })
            .addChoices({
                name: 'Chinese (Simplified)',
                value: 'zh',
            })
            .addChoices({
                name: 'Chinese (Traditional)',
                value: 'zh-tw',
            })
            .addChoices({
                name: 'Croatian',
                value: 'hr',
            })
            .addChoices({
                name: 'Czech',
                value: 'cs',
            })
            .addChoices({
                name: 'Danish',
                value: 'da',
            })
            .addChoices({
                name: 'Dutch',
                value: 'nl',
            })
            .addChoices({
                name: 'English',
                value: 'en',
            })
            .addChoices({
                name: 'French',
                value: 'fr',
            })
            .addChoices({
                name: 'German',
                value: 'de',
            })
            .addChoices({
                name: 'Indonesian',
                value: 'id',
            })
            .addChoices({
                name: 'Latin',
                value: 'la',
            })
            .addChoices({
                name: 'Russian',
                value: 'ru',
            })
            .addChoices({
                name: 'Ukrainian',
                value: 'uk',
            })
            .setRequired(true)
    );
