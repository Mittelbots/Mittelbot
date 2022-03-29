const cmd_help = require('../../../src/assets/json/command_config/command_help.json');
const config = require('../../../src/assets/json/_config/config.json');

const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { isOnBanList } = require('../../../utils/functions/moderations/checkOpenInfractions');
const { removeMention } = require('../../../utils/functions/removeCharacters');

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

    let member = args[0];

    if (!member) return message.reply(`You have to mention a user`).catch(err => {});
    else member = removeMention(member);

    let isOnBanListCB = await isOnBanList(member, message);
    return (isOnBanListCB[0]) ? message.reply(`This user is banned! Reason: ${isOnBanListCB[1]}`) : message.reply('This user isn\'t banned!');
}

module.exports.help = cmd_help.moderation.isbanned;