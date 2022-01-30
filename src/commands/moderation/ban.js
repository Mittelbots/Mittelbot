const config = require('../../../src/assets/json/_config/config.json');
const { getModTime } = require('../../../utils/functions/getModTime');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { isMod } = require('../../../utils/functions/isMod');
const { log } = require('../../../logs');
const { banUser } = require('../../../utils/functions/moderations/banUser');
const { isBanned } = require('../../../utils/functions/moderations/checkOpenInfractions');
const { checkMessage } = require('../../../utils/functions/checkMessage/checkMessage');
const { removeMention } = require('../../../utils/functions/removeCharacters');
const {Database} = require('../../db/db')

module.exports.run = async (bot, message, args) => {

    const database = new Database();

    if(config.deleteModCommandsAfterUsage  == 'true') {
        message.delete();
    }

    if(!await hasPermission(message, database, 0, 1)) {
        message.delete();
        database.close();
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
    }

    try {
        args[0] = removeMention(args[0]);

        var Member = await message.guild.members.fetch(args[0]);

        if(checkMessage(message, Member, bot, 'ban')) return message.reply(checkMessage(message, Member, bot, 'ban'));
    }catch(err) {
        database.close();
        return message.reply(`I can't find this user!`);
    }

    if (await isMod(Member, message, database)) {
        database.close();
        return message.channel.send(`<@${message.author.id}> You can't ban a Moderator!`)
    }


    let x = 1;
    var time = args[x]

    if(time === undefined) {
        database.close();
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
        database.close();
        return message.channel.send('Please add a reason!');
    }

    if(await isBanned(database, Member, message)) {
        database.close();
        return message.reply('This user is already banned!')
    }

    return banUser(database, Member, message, reason, bot, config, log, dbtime, time);
}

module.exports.help = {
    name:"ban",
    description: "Ban an User",
    usage: "ban <Mention User> <Reason>"
}