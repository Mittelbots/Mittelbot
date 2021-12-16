const config = require('../../../config.json');
const { setNewModLogMessage } = require('../../../utils/modlog/modlog');
const { publicModResponses } = require('../../../utils/publicResponses/publicModResponses');

module.exports.run = async (bot, message, args) => {
    if(config.deleteModCommandsAfterUsage  == 'true') {
        message.delete();
    }

    var hasPermission = false
    for(let i in config.modroles) {
        if(i == "trialmoderator") continue;

        if(message.member.roles.cache.find(r => r.name === config.modroles[i]) !== undefined) {
            hasPermission = true;
            break;
        }
    }
    if(!hasPermission) {
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
    }

    let Member = args[0];
    if (!Member) return message.reply(`<@${message.author.id}> You have to mention a user`);
    Member = await Member.replace('<', '').replace('@', '').replace('!', '').replace('>', '');

    let reason = args.slice(1).join(" ");
    if(!reason) return message.channel.send('Please add a reason!');

    try {
        setNewModLogMessage(bot, config.defaultModTypes.unban, message.author.id, Member, reason);
        publicModResponses(message, config.defaultModTypes.unban, message.author.id, Member, reason);
        return await message.guild.members.unban(`${Member}`, `${reason}`);
    }catch(err) {
        return await message.reply(`The User is not banned.`);
    }
}

module.exports.help = {
    name:"unban",
    description: "Unban an User",
    usage: "unban <Mention User> <Reason>"
}