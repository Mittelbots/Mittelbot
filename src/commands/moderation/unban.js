const config = require('../../../src/assets/json/_config/config.json');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { log } = require('../../../logs');
const { removeMention } = require('../../../utils/functions/removeCharacters');
const { isBanned } = require('../../../utils/functions/moderations/checkOpenInfractions');
const { unbanUser } = require('../../../utils/functions/moderations/unbanUser');

module.exports.run = async (bot, message, args) => {
    if(config.deleteModCommandsAfterUsage  == 'true') {
        message.delete().catch(err => {});
    }

    if(!await hasPermission(message, 0, 1)) {
        message.delete().catch(err => {});
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete().catch(err => {}), 5000);
        }).catch(err => {});
    }

    let Member = args[0];
    if (!Member) {
        return message.reply(`You have to mention a user`).catch(err => {});
    }
    Member = removeMention(Member)

    let reason = args.slice(1).join(" ");
    if(!reason) {
         
        return message.channel.send('Please add a reason!').catch(err => {});
    }


    if(await isBanned(Member, message) == false) {
        return message.reply('This user isn`t banned!').catch(err => {});
    }

    return await unbanUser(Member, config, message, log, reason, bot);
}

module.exports.help = {
    name:"unban",
    description: "Unban an User",
    usage: "unban <Mention User> <Reason>"
}