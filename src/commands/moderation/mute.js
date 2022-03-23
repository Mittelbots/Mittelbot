const config = require('../../../src/assets/json/_config/config.json');
const cmd_help = require('../../../src/assets/json/command_config/command_help.json');

const { getModTime } = require('../../../utils/functions/getModTime');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { isMod } = require('../../../utils/functions/isMod');
const { removeMention } = require('../../../utils/functions/removeCharacters');
const { checkMessage } = require('../../../utils/functions/checkMessage/checkMessage');
const { muteUser } = require('../../../utils/functions/moderations/muteUser');
const { isMuted } = require('../../../utils/functions/moderations/checkOpenInfractions');
const { log } = require('../../../logs');


module.exports.run = async (bot, message, args) => {
    if (config.deleteModCommandsAfterUsage == 'true') {
        message.delete().catch(err => {});
    }

    if (!await hasPermission(message, 0, 0)) {
        message.delete().catch(err => {});
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete().catch(err => {}), 5000);
        }).catch(err => {});
    }

    try {
        args[0] = removeMention(args[0]);
        var Member = await message.guild.members.fetch(args[0]);

        if(checkMessage(message, Member, bot, 'mute')) {
            return message.reply(checkMessage(message, Member, bot, 'mute')).catch(err => {});
        }
    }catch(err) {
        return message.reply(`I can't find this user!`).catch(err => {});
    }
    
    if (await isMod(Member, message)) {
        return message.channel.send(`<@${message.author.id}> You can't mute a Moderator!`).catch(err => {});
    }

    let x = 1;
    var time = args[x]

    while(time == '') {
        time = args[x];
        x++;
    }

    let dbtime = getModTime(time);
    if(!dbtime) {
        time = 'Permanent';
        dbtime = getModTime('99999d');
    }

    let reason = args.slice(x).join(" ");
    reason = reason.replace(time, '');

    if (!reason) {
        return message.channel.send('Please add a reason!').catch(err => {});
    }

    if(await isMuted(config, Member, message, log, bot)) {
        return message.reply('This user is already muted!').catch(err => {});
    }

    if(config.debug == 'true') console.info('Mute Command passed!');

    return await muteUser(Member, message, bot, config, reason, time, dbtime)
}

module.exports.help = cmd_help.moderation.mute;