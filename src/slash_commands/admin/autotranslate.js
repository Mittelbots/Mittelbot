const { SlashCommandBuilder } = require("@discordjs/builders");
const { saveNewTranslateConfig } = require("../../../utils/functions/data/translate");
const {
    hasPermission
} = require('../../../utils/functions/hasPermissions');
const config = require('../../../src/assets/json/_config/config.json');

module.exports.run = async ({main_interaction, bot}) => {
    const translate_language = main_interaction.options.getString("language");
    const translate_target = main_interaction.options.getChannel("target").id;
    const translate_log_channel = main_interaction.options.getChannel("log").id;

    if (!await hasPermission(main_interaction, 1, 0)) {
        return main_interaction.reply({
            content: `${config.errormessages.nopermission}`,
            ephemeral: true
        }).catch(err => {});
    }

    saveNewTranslateConfig({
        guild_id: main_interaction.guild.id,
        translate_log_channel,
        translate_language,
        translate_target
    }).then(() => {
        return main_interaction.reply({
            content: "Successfully updated translate config!",
            ephemeral: true
        }).catch(err => {})
    }).catch(() => {
        return main_interaction.reply({
            content: "Something went wrong while updating translate config!",
            ephemeral: true
        }).catch(err => {})
    })
}

module.exports.data = new SlashCommandBuilder()
	.setName('autotranslate')
	.setDescription('Translate messages from one language to another into a given Channel.')
    .addChannelOption(channel => 
        channel
            .setName('target')
            .setDescription('The channel where the messages will be translated.')
            .setRequired(true)
    )
    .addChannelOption(channel =>
        channel
            .setName('log')
            .setDescription('The channel where the translated messages will be logged.')    
            .setRequired(true)
    )
    .addStringOption(option =>
        option
            .setName('language')
            .setDescription('Select a language')
            .addChoices({
                name: 'auto',
                value: 'auto'
            })
            .addChoices({
                name: 'Afrikaans',
                value: 'af'
            })
            .addChoices({
                name: 'Arabic',
                value: 'ar'
            })
            .addChoices({
                name: 'Azerbaijani',
                value: 'az'
            })
            .addChoices({
                name: 'Bosnian',
                value: 'bs'
            })
            .addChoices({
                name: 'Bulgarian',
                value: 'bg'
            })
            .addChoices({
                name: 'Chinese (Simplified)',
                value: 'zh'
            })
            .addChoices({
                name: 'Chinese (Traditional)',
                value: 'zh-tw'
            })
            .addChoices({
                name: 'Croatian',
                value: 'hr'
            })
            .addChoices({
                name: 'Czech',
                value: 'cs'
            })
            .addChoices({
                name: 'Danish',
                value: 'da'
            })
            .addChoices({
                name: 'Dutch',
                value: 'nl'
            })
            .addChoices({
                name: 'English',
                value: 'en'
            })
            .addChoices({
                name: 'French',
                value: 'fr'
            })
            .addChoices({
                name: 'German',
                value: 'de'
            })
            .addChoices({
                name: 'Indonesian',
                value: 'id'
            })
            .addChoices({
                name: 'Latin',
                value: 'la'
            })
            .addChoices({
                name: 'Russian',
                value: 'ru'
            })
            .addChoices({
                name: 'Ukrainian',
                value: 'uk'
            })
            .setRequired(true)
    )