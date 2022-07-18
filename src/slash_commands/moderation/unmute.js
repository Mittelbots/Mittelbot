const {
    SlashCommandBuilder
} = require('discord.js');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { unmuteUser } = require('../../../utils/functions/moderations/unmuteUser');


module.exports.run = async ({main_interaction, bot}) => {
    if (!await hasPermission(main_interaction, 0, 0)) {
        return main_interaction.reply({
            content: `<@${main_interaction.user.id}> ${config.errormessages.nopermission}`,
            ephemeral: true
        }).catch(err => {});
    }

    const user = main_interaction.options.getUser('user');
    const reason = main_interaction.options.getString('reason');

    const unmuted = await unmuteUser({user, bot, mod: main_interaction.user, reason, guild: main_interaction.guild});

    if (unmuted.error) {
        return main_interaction.reply({
            content: unmuted.message,
            ephemeral: true
        }).catch(err => {});
    }

    return main_interaction.reply({
        embeds: [unmuted.message],
        ephemeral: true
    }).catch(err => {});
}


module.exports.data = new SlashCommandBuilder()
    .setName('unmute')
    .setDescription('Unmute an user from the server')
    .addUserOption(option =>
        option.setName('user')
        .setDescription('The user to unmute')
        .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('reason')
        .setDescription('The reason for the unmute')
        .setRequired(false)
    )