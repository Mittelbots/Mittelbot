const { SlashCommandBuilder } = require("discord.js")
const {
    hasPermission
} = require('../../../utils/functions/hasPermissions');
const { updateXP, gainXP } = require("../../../utils/functions/levelsystem/levelsystemAPI");
const config = require('../../assets/json/_config/config.json');

module.exports.run = async ({main_interaction, bot}) => {

    const hasPermissions = await hasPermission({
        guild_id: main_interaction.guild.id,
        adminOnly: false,
        modOnly: true,
        user: main_interaction.member
    })
    if (!hasPermissions) {
        return main_interaction.reply({
            content: `${config.errormessages.nopermission}`,
            ephemeral: true
        }).catch(err => {});
    }

    const user = main_interaction.options.getUser('user');
    const amount = main_interaction.options.getNumber('xp')

    if(user.bot || user.system) {
        return main_interaction.reply({
            content: '❌ You can\'t remove xp from a bot or a system account.',
            ephemeral: true
        }).catch(err => {})
    }

    const currentXP = await gainXP({
        guild_id: main_interaction.guild.id,
        user_id: user.id
    })

    if(!currentXP) {
        return main_interaction.reply({
            content: '❌ Something went wrong while fetching the xp. Please contact the Bot support.',
            ephemeral: true
        }).catch(err => {})
    }

    var newAmount = Number(currentXP) - Number(amount);

    if(newAmount < 0) newAmount = 0;

    const updated = await updateXP({
        guild_id: main_interaction.guild.id,
        user_id: user.id,
        newxp: newAmount
    })

    if(updated) {
        return main_interaction.reply({
            content: `✅ ${amount}xp has been added to ${user}`,
            ephemeral: true
        }).catch(err => {})
    }else {
        return main_interaction.reply({
            content: '❌ Something went wrong while adding the xp. Please contact the Bot support.',
            ephemeral: true
        }).catch(err => {})
    }

}

module.exports.data = new SlashCommandBuilder()
	.setName('removexp')
	.setDescription('Remove xp from someone. *Cheating vibes*')
    .addUserOption(option =>
        option
        .setName('user')
        .setDescription('The user which will have less xp afterwards.')
        .setRequired(true)
    )
    .addNumberOption(option =>
        option
        .setName('xp')
        .setDescription('How many xp you want to remove?')
        .setRequired(true)
    )