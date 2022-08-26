const { SlashCommandBuilder } = require("discord.js")
const {
    hasPermission
} = require('../../../utils/functions/hasPermissions');
const { updateXP, gainXP } = require("../../../utils/functions/levelsystem/levelsystemAPI");
const config = require('../../assets/json/_config/config.json');

module.exports.run = async ({main_interaction, bot}) => {

    await main_interaction.deferReply({
        ephemeral: true
    })

    const hasPermissions = await hasPermission({
        guild_id: main_interaction.guild.id,
        adminOnly: true,
        modOnly: false,
        user: main_interaction.member,
        bot
    });

    if (!hasPermissions) {
        return main_interaction.followUp({
            content: `${config.errormessages.nopermission}`,
            ephemeral: true
        }).catch(err => {});
    }

    const user = main_interaction.options.getUser('user');
    const amount = main_interaction.options.getNumber('xp')

    if(user.bot || user.system) {
        return main_interaction.followUp({
            content: '❌ You can\'t add xp to a bot or a system account.',
            ephemeral: true
        }).catch(err => {})
    }

    const currentXP = await gainXP({
        guild_id: main_interaction.guild.id,
        user_id: user.id
    })

    const updated = await updateXP({
        guild_id: main_interaction.guild.id,
        user_id: user.id,
        newxp: Number(currentXP) + Number(amount)
    })

    if(updated) {
        return main_interaction.followUp({
            content: `✅ ${amount}xp has been added to ${user}`
        }).catch(err => {})
    }else {
        return main_interaction.followUp({
            content: '❌ Something went wrong while adding the xp. Please contact the Bot support.',
            ephemeral: true
        }).catch(err => {})
    }

}

module.exports.data = new SlashCommandBuilder()
	.setName('givexp')
	.setDescription('Give someone an amount of xp. *Cheating vibes*')
    .addUserOption(option =>
        option
        .setName('user')
        .setDescription('The user which will be get the xp.')
        .setRequired(true)
    )
    .addNumberOption(option =>
        option
        .setName('xp')
        .setDescription('How many xp you want to add?')
        .setRequired(true)
    )