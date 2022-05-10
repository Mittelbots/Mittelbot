const config = require('../../../src/assets/json/_config/config.json');
const cmd_help = require('../../../src/assets/json/command_config/command_help.json');

const {
    getModTime
} = require('../../../utils/functions/getModTime');
const {
    hasPermission
} = require('../../../utils/functions/hasPermissions');
const {
    isMod
} = require('../../../utils/functions/isMod');
const {
    log
} = require('../../../logs');
const {
    banUser
} = require('../../../utils/functions/moderations/banUser');
const {
    isBanned
} = require('../../../utils/functions/moderations/checkOpenInfractions');
const {
    checkMessage
} = require('../../../utils/functions/checkMessage/checkMessage');
const {
    removeMention
} = require('../../../utils/functions/removeCharacters');

module.exports.run = async (bot, message, args) => {
    if (config.deleteModCommandsAfterUsage == 'true') {
        message.delete().catch(err => {});
    }

    if (!await hasPermission(message, 0, 1)) {
        message.delete().catch(err => {});

        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete().catch(err => {}), 5000);
        }).catch(err => {});
    }

    var Member;
    let isOnTheServer = true

    if(!args[0]) return message.reply({
        content: `You have to mention an user!`
    });

    args[0] = removeMention(args[0]);

    Member = await message.guild.members.fetch(args[0])
        .catch(err => {
            isOnTheServer = false
            return args[0];
        })

    if (isOnTheServer) {
        if (checkMessage(message, Member, bot, 'ban')) return message.reply(checkMessage(message, Member, bot, 'ban')).catch(err => {});

        if (await isMod(Member, message)) {
            return message.channel.send(`<@${message.author.id}> You can't ban a Moderator!`).catch(err => {});
        }
    }


    if (await isBanned(Member, message)) {
        return message.reply('This user is already banned!').catch(err => {});
    }

    let x = 1;
    var time = args[x]

    if (time === undefined) {
        return message.reply('Please add a valid time and reason!').catch(err => {});
    }

    while (time == '') {
        time = args[x];
        x++;
    }

    let dbtime = getModTime(time);
    if (!dbtime) {
        time = 'Permanent';
        dbtime = getModTime('99999d');
    }

    let reason = args.slice(x).join(" ");
    reason = reason.replace(time, '');

    if (!reason) {
        return message.channel.send('Please add a reason!').catch(err => {});
    }

    return banUser(Member, message, reason, bot, config, log, dbtime, time);
}

module.exports.help = cmd_help.moderation.ban;