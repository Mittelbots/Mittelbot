const {
    SlashCommandBuilder
} = require('discord.js');

const config = require('../../../src/assets/json/_config/config.json');

const {
    getModTime
} = require('../../../utils/functions/getModTime');
const {
    hasPermission
} = require('../../../utils/functions/hasPermissions');
const {
    banUser
} = require('../../../utils/functions/moderations/banUser');
const {
    isBanned
} = require('../../../utils/functions/moderations/checkOpenInfractions');
const {
    checkMessage
} = require('../../../utils/functions/checkMessage/checkMessage');

module.exports.run = async ({main_interaction, bot}) => {

    await main_interaction.deferReply({
        ephemeral: true
    })

    const hasPermissions = await hasPermission({
        guild_id: main_interaction.guild.id,
        adminOnly: false,
        modOnly: true,
        user: main_interaction.member,
        bot
    })

    if (!hasPermissions) {
        return main_interaction.followUp({
            content: `<@${main_interaction.user.id}> ${config.errormessages.nopermission}`,
            ephemeral: true
        }).catch(err => {});
    }

    const user = main_interaction.options.getUser('user');
    
    const check = await checkMessage({
        author: main_interaction.user,
        guild: main_interaction.guild,
        target: user,
        bot,
        type: 'ban'
    });
    
    if(check) return main_interaction.followUp({
        content: check,
        ephemeral: true
    }).catch(err => {});
    
    const isUserBanned = await isBanned(user, main_interaction.guild);
    
    if(isUserBanned.error) {
        return main_interaction.followUp({
            content: isUserBanned.message,
            ephemeral: true
        }).catch(err => {});
    }

    if (isUserBanned.isBanned) {
        return main_interaction.followUp({
            content: 'This user is already banned!',
            ephemeral: true
        }).catch(err => {});
    }

    var time = main_interaction.options.getString('time');

    let dbtime = getModTime(time);

    if (!dbtime) {
        time = 'Permanent';
        dbtime = getModTime('99999d');
    }

    let reason = main_interaction.options.getString('reason') || 'No reason provided';

    const banned = await banUser({
        user, 
        mod: main_interaction.user,
        guild: main_interaction.guild,
        reason, bot, dbtime, time
    });

    if(banned.error) {
        return main_interaction.followUp({
            content: banned.message,
            ephemeral: true
        }).catch(err => {});
    }
    
    return main_interaction.followUp({
        embeds: [banned.message],
        ephemeral: true
    }).catch(err => {});
}

module.exports.data = new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server')
    .addUserOption(option =>
        option.setName('user')
        .setDescription('The user to ban')
        .setRequired(true)
    )
    .addStringOption(option =>
        option.setName('time')    
        .setDescription('The time to ban the user for')
        .setRequired(false)
    )
    .addStringOption(option =>
        option.setName('reason')
        .setDescription('The reason for the ban')
        .setRequired(false)
    )