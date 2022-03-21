const config = require('../../../src/assets/json/_config/config.json');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { log } = require('../../../logs');
const { removeMention } = require('../../../utils/functions/removeCharacters');
const { unmuteUser } = require('../../../utils/functions/moderations/unmuteUser');

module.exports.run = async (bot, message, args) => {
    if(config.deleteModCommandsAfterUsage  == 'true') {
        message.delete().catch(err => {});
    }
    if(!await hasPermission(message, 0, 0)) {
        message.delete().catch(err => {});
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete().catch(err => {}), 5000);
        }).catch(err => {});
    }

    try {
        args[0] = removeMention(args[0]);

        var Member = await message.guild.members.fetch(args[0]);
        
    }catch(err) {
         
        return message.reply(`I can't find this user!`).catch(err => {});
    }    
    
    let reason = args.slice(1).join(" ");

    return await unmuteUser(message, Member, bot, config, reason, log);

}

module.exports.help = {
    name:"unmute"
}