const { SlashCommandBuilder } = require("@discordjs/builders");
const { updateConfig } = require("../../../utils/functions/data/getConfig");
const {
    hasPermission
} = require('../../../utils/functions/hasPermissions');
const config = require('../../../src/assets/json/_config/config.json');

module.exports.run = async ({main_interaction, bot}) => {

    if (!await hasPermission(main_interaction, 1, 0)) {
        return main_interaction.reply({
            content: `<@${main_interaction.user.id}> ${config.errormessages.nopermission}`,
            ephemeral: true
        }).catch(err => {});
    }

    switch (main_interaction.options.getSubcommand()) {

        case 'mode':
            const mode = main_interaction.options.getString('mode');

            const updated = await updateConfig({
                guild_id: main_interaction.guild.id,
                value: mode,
                valueName: "levelsettings"
            });

            if(updated) {
                return main_interaction.reply({
                    content: '✅ Successfully saved your level config to ' + mode,
                    ephemeral: true
                })
            }else {
                return main_interaction.reply({
                    content: '❌ Somethings went wrong while changing your level confit to ' + mode,
                    ephemeral: true
                })
            }

    }

}

module.exports.data = new SlashCommandBuilder()
	.setName('levelsettings')
	.setDescription('Translate messages from one language to another into a given Channel.')
    .addSubcommand(command =>
        command
        .setName('mode')
        .setDescription('Select your mode for the levels. Easy, normal, hard.')
        .addStringOption(dmcau =>
            dmcau
            .setName('mode')
            .setDescription('Easy: Fast level up, normal: normal time to level up, hard: Will take some time to level up')
            .setRequired(true)
            .addChoices({
                name: 'Easy',
                value: 'easy'
            })
            .addChoices({
                name: 'Normal',
                value: 'normal'
            })
            .addChoices({
                name: 'Hard',
                value: 'hard'
            })
        )
    )