const {
    SlashCommandBuilder
} = require('discord.js');
const {
    hasPermission
} = require('../../../utils/functions/hasPermissions');
const config = require('../../../src/assets/json/_config/config.json');
const { isOnBanList } = require('../../../utils/functions/moderations/checkOpenInfractions');

module.exports.run = async ({main_interaction, bot}) => {
    if(!await hasPermission(main_interaction, 0, 0)) {
        return main_interaction.reply({
            content: `<@${main_interaction.user.id}> ${config.errormessages.nopermission}`,
            ephemeral: true
        }).catch(err => {});
    }

    const user = main_interaction.options.getUser('user');
    let isOnBanListCB = await isOnBanList({
        user, 
        guild: main_interaction.guild
    });
    
    return main_interaction.reply({
        content: (isOnBanListCB[0]) ? `This user is banned! Reason: \`${isOnBanListCB[1]}\` by ${isOnBanListCB[2]}` : 'This user isn\'t banned!',
        ephemeral: true
    }).catch(err => {})
}

module.exports.data = new SlashCommandBuilder()
    .setName('isbanned')
    .setDescription('See if an user is banned')
    .addUserOption(option =>
        option.setName('user')
        .setRequired(true)
        .setDescription('The user to check')
    )