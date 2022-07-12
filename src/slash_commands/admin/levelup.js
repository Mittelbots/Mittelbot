const { SlashCommandBuilder } = require("@discordjs/builders");
const { hasPermission } = require("../../../utils/functions/hasPermissions");
const config = require('../../../src/assets/json/_config/config.json');
const { changeLevelUp } = require("../../../utils/functions/levelsystem/levelsystemAPI");

module.exports.run = async ({main_interaction, bot}) => {

    if (!await hasPermission(main_interaction, 1, 0)) {
        return main_interaction.reply({
            content: `${config.errormessages.nopermission}`,
            ephemeral: true
        }).catch(err => {});
    }

    const type = main_interaction.options.getString('type');
    const channel = main_interaction.options.getChannel('channel')


    changeLevelUp({
        type,
        guild: main_interaction.guild,
        channel
    }).then(res => {
        main_interaction.reply({
            content: res,
            ephemeral: true
        }).catch(err => {})
    }).catch(err => {
        main_interaction.reply({
            content: err,
            ephemeral: true
        }).catch(err => {});
    });
}

module.exports.data = new SlashCommandBuilder()
	.setName('levelup')
	.setDescription('Change the way the user get the levelup message')
    .addStringOption(option => 
        option.setName('type')
        .setDescription('Select between dm or text channel.')
        .setRequired(true)
        .addChoices({
            name: 'DM',
            value: 'dm'
        })
        .addChoices({
            name: 'Text Channel',
            value: 'channel'
        })
    )
    .addChannelOption(option =>
        option.setName('channel')
        .setDescription('Add a chennel if you want to send levelup messages to a text channel')
        .setRequired(false)
    )