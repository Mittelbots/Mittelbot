const config = require('../../../config.json');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { log } = require('../../../logs');
const { removeMention } = require('../../../utils/functions/removeCharacters');
const { unmuteUser } = require('../../../utils/functions/moderations/unmuteUser');

const {Database} = require('../../db/db')

module.exports.run = async (bot, message, args) => {

    const database = new Database();

    if(config.deleteModCommandsAfterUsage  == 'true') {
        message.delete();
    }
    if(!await hasPermission(message, database, 0, 0)) {
        database.close();
        message.delete();
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
    }

    try {
        args[0] = removeMention(args[0]);

        var Member = await message.guild.members.fetch(args[0]);
        
    }catch(err) {
        database.close();
        return message.reply(`I can't find this user!`);
    }    
    
    let reason = args.slice(1).join(" ");

    return await unmuteUser(database, message, Member, bot, config, reason, log);

}

module.exports.help = {
    name:"unmute"
}