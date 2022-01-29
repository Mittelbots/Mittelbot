const config = require('../../../config.json');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { isMod } = require('../../../utils/functions/isMod');
const { checkMessage } = require('../../../utils/functions/checkMessage/checkMessage');
const { removeMention } = require('../../../utils/functions/removeCharacters');
const { kickUser } = require('../../../utils/functions/moderations/kickUser');

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
        args[0] = removeMention(args[0])

        var Member = await message.guild.members.fetch(args[0]);
        
        if(checkMessage(message, Member, bot, 'kick')) {
            database.close();
            return message.reply(checkMessage(message, Member, bot, 'kick'));
        }
    }catch(err) {
        database.close();
        return message.reply(`I can't find this user!`);
    }

    let reason = args.slice(1).join(" ");
    if (!reason) {
        database.close();
        return message.channel.send('Please add a reason!');
    }

    if (await isMod(Member, message, database)) {
        database.close();
        return message.channel.send(`<@${message.author.id}> You can't kick a Moderator!`)
    }


    return await kickUser(bot, Member, message, config, reason, database);
}

module.exports.help = {
    name: "kick",
    description: "Kick an User",
    usage: "kick <Mention User> <Reason>"
}