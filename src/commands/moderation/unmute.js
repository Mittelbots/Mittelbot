const config = require('../../../config.json');
const { setNewModLogMessage } = require('../../../utils/modlog/modlog');
const { privateModResponse } = require('../../../utils/privatResponses/privateModResponses');
const { publicModResponses } = require('../../../utils/publicResponses/publicModResponses');
const { hasPermission } = require('../../../utils/functions/hasPermissions');

module.exports.run = async (bot, message, args) => {
    if(config.deleteModCommandsAfterUsage  == 'true') {
        message.delete();
    }
    if(!hasPermission(message, 0, 0)) {
        message.delete();
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
    }

    try {
        var Member = message.mentions.members.first() || await message.guild.members.fetch(args[0]);
    }catch(err) {
        message.delete();
        return message.channel.send(`<@${message.author.id}> You have to mention a user`);
    }

    var MutedRole = message.guild.roles.cache.find(role => role.name === "Muted").id
    
    if(!Member.roles.cache.has(MutedRole)) return message.channel.send(`<@${message.author.id}> The user isnt't muted.`)
    
    let reason = args.slice(1).join(" ");

    try {
        setNewModLogMessage(bot, config.defaultModTypes.unmute, message.author.id, Member.id, reason);
        publicModResponses(message, config.defaultModTypes.unmute, message.author.id, Member.id, reason);
        privateModResponse(Member, config.defaultModTypes.unmute, reason);
        return Member.roles.remove([MutedRole]);
    }
    catch(err) {
        console.log(err);
        message.channel.send(config.errormessages.general)
    }

}

module.exports.help = {
    name:"unmute"
}