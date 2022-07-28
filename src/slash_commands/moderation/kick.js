const {
    SlashCommandBuilder
} = require('discord.js');
const { kickUser } = require('../../../utils/functions/moderations/kickUser');
const { checkMessage } = require('../../../utils/functions/checkMessage/checkMessage');
const { hasPermission } = require('../../../utils/functions/hasPermissions');

module.exports.run = async ({main_interaction, bot}) => {

    const hasPermissions = await hasPermission({
        guild_id: main_interaction.guild.id,
        adminOnly: false,
        modOnly: true,
        user: main_interaction.member
    })

    if (!hasPermissions) {
        return main_interaction.reply({
            content: `<@${main_interaction.user.id}> ${config.errormessages.nopermission}`,
            ephemeral: true
        }).catch(err => {});
    }

    const user = main_interaction.options.getUser('user');

    const check = await checkMessage({
        author: main_interaction.user,
        target: user,
        guild: main_interaction.guild,
        bot,
        type: 'kick'
    });

    if(check) return main_interaction.reply({
        content: check,
        ephemeral: true
    }).catch(err => {});

    let reason = main_interaction.options.getString('reason') || 'No reason provided';

    const kicked = await kickUser({user, mod: main_interaction.user, guild: main_interaction.guild, reason, bot});

    if(kicked.error) return main_interaction.reply({
        content: kicked.message,
        ephemeral: true
    }).catch(err => {});

    return main_interaction.reply({
        embeds: [kicked.message],
        ephemeral: true
    }).catch(err => {});
}

module.exports.data = new SlashCommandBuilder()
    .setName('kick')
    .setDescription('Kick a user from the server')
    .addUserOption(option =>
        option.setName('user')
        .setDescription('The user to ban')
        .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('reason')
        .setDescription('The reason for the ban')
        .setRequired(false)
    )