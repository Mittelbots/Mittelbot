const config = require('../../../src/assets/json/_config/config.json');
const { getModTime } = require('../../../utils/functions/getModTime');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { isMod } = require('../../../utils/functions/isMod');
const { log } = require('../../../logs');
const { banUser } = require('../../../utils/functions/moderations/banUser');
const { isBanned } = require('../../../utils/functions/moderations/checkOpenInfractions');
const { checkMessage } = require('../../../utils/functions/checkMessage/checkMessage');
const { removeMention } = require('../../../utils/functions/removeCharacters');

module.exports.run = async (bot, message, args) => {
    if(config.deleteModCommandsAfterUsage  == 'true') {
        message.delete();
    }

    if(!await hasPermission(message, 0, 1)) {
        message.delete();
         
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
    }

    try {
        args[0] = removeMention(args[0]);

        var Member = await message.guild.members.fetch(args[0]);

        if(checkMessage(message, Member, bot, 'ban')) return message.reply(checkMessage(message, Member, bot, 'ban'));
    }catch(err) {
        return message.reply(`I can't find this user!`);
    }

    if (await isMod(Member, message)) {
         
        return message.channel.send(`<@${message.author.id}> You can't ban a Moderator!`)
    }


    let x = 1;
    var time = args[x]

    if(time === undefined) {
         
        return message.reply('Please add a valid time and reason!');
    }

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

    if(!reason) {
         
        return message.channel.send('Please add a reason!');
    }

    if(await isBanned(Member, message)) {
         
        return message.reply('This user is already banned!')
    }

    return banUser(Member, message, reason, bot, config, log, dbtime, time);
}

module.exports.help = {
    name:"ban",
    description: "Ban an User",
    usage: "ban <Mention User> <Reason>"
}