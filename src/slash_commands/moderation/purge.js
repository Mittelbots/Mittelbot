const {
    SlashCommandBuilder
} = require('discord.js');
const config = require('../../../src/assets/json/_config/config.json');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const { hasPermission } = require('../../../utils/functions/hasPermissions');

module.exports.run = async ({main_interaction, bot}) => {
    if (!await hasPermission(main_interaction, 0, 0)) {
        return main_interaction.reply({
            content: `<@${main_interaction.user.id}> ${config.errormessages.nopermission}`,
            ephemeral: true
        }).catch(err => {});
    }

    const amount = main_interaction.options.getNumber('number');

    if(amount < 1 || amount >= Number(config.bulkDeleteLimit)) {
        return main_interaction.reply({
            content: `You need to input a number between 1 and ${config.bulkDeleteLimit}.`,
            ephemeral: true
        }).catch(err => {});
    }

    await main_interaction.channel.bulkDelete(amount, true).then(() => {
        main_interaction.reply({
            content: `Successfully pruned ${amount} messages`,
            ephemeral: true
        }).catch((err) => {})

    }).catch(err => {
        errorhandler({err})
        main_interaction.reply({
            content: `There was an error trying to prune messages in this channel! (I can only delete messages younger then 14 Days!)`,
            ephemeral: true
        }).catch((err) => {})
    });
}

module.exports.data = new SlashCommandBuilder()
    .setName('purge')
    .setDescription('Purge a number of messages from a channel')
    .addNumberOption(option =>
        option.setName('number')
        .setRequired(true)
        .setDescription('The number of message to delete')

    )
    // .addUserOption(option =>
    //     option.setName('user')
    //     .setDescription('The user to purge')
    //     .setRequired(true)
    // )