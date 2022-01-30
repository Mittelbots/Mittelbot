const config = require('../../../src/assets/json/_config/config.json');
const { getModTime } = require('../../../utils/functions/getModTime');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { isMod } = require('../../../utils/functions/isMod');
const { removeMention } = require('../../../utils/functions/removeCharacters');
const { checkMessage } = require('../../../utils/functions/checkMessage/checkMessage');
const { muteUser } = require('../../../utils/functions/moderations/muteUser');
const { isMuted } = require('../../../utils/functions/moderations/checkOpenInfractions');
const {Database} = require('../../db/db')


module.exports.run = async (bot, message, args) => {

    const database = new Database();

    if (config.deleteModCommandsAfterUsage == 'true') {
        message.delete();
    }

    if (!await hasPermission(message, database, 0, 0)) {
        database.close();
        message.delete();
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
    }

    try {
        args[0] = removeMention(args[0]);
        var Member = await message.guild.members.fetch(args[0]);

        if(checkMessage(message, Member, bot, 'mute')) {
            database.close();
            return message.reply(checkMessage(message, Member, bot, 'mute'));
        }
    }catch(err) {
        database.close();
        return message.reply(`I can't find this user!`);
    }
    
    if (await isMod(Member, message, database)) {
        database.close();
        return message.channel.send(`<@${message.author.id}> You can't mute a Moderator!`)
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
        database.close();
        return message.channel.send('Please add a reason!');
    }


    if(await isMuted(database, config, Member, message)) {
        database.close();
        return message.reply('This user is already muted!');
    }

    if(config.debug == 'true') console.info('Mute Command passed!');

    return await muteUser(Member, message, bot, config, reason, time, dbtime, database)
}

module.exports.help = {
    name: "mute",
    description: "Mute a User",
    usage: "Mute <Mention User> <Reason>"
}