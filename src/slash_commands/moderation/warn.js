const {
    SlashCommandBuilder
} = require('discord.js');
const config = require('../../../src/assets/json/_config/config.json');
const { checkMessage } = require('../../../utils/functions/checkMessage/checkMessage');
const { warnUser } = require('../../../utils/functions/moderations/warnUser');
const { log } = require('../../../logs');

const { hasPermission } = require('../../../utils/functions/hasPermissions');

module.exports.run = async ({main_interaction, bot}) => {

    const hasPermissions = await hasPermission({
        guild_id: main_interaction.guild.id,
        adminOnly: false,
        modOnly: false,
        user: main_interaction.member,
        bot
    })

    if (!hasPermissions) {
        return main_interaction.reply({
            content: `<@${main_interaction.user.id}> ${config.errormessages.nopermission}`,
            ephemeral: true
        }).catch(err => {});
    }

    const user = main_interaction.options.getUser('user');
    const reason = main_interaction.options.getString('reason');

    const check = await checkMessage({
        author: main_interaction.user,
        target: user,
        guild: main_interaction.guild,
        bot,
        type: 'warn'
    });
    
    if(check) return main_interaction.reply({
        content: check,
        ephemeral: true
    }).catch(err => {});

    const warned = await warnUser({bot, user, mod: main_interaction.user, guild: main_interaction.guild, reason});

    if(warned.error) return main_interaction.reply({
        content: warned.message,
        ephemeral: true
    }).catch(err => {});

    return main_interaction.reply({
        embeds: [warned.message],
        ephemeral: true
    }).catch(err => {});
}

module.exports.data = new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn an user from the server')
    .addUserOption(option =>
        option.setName('user')
        .setDescription('The user to ban')
        .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('reason')
        .setDescription('The reason for the warn')
        .setRequired(true)
    )