const config = require('../../../src/assets/json/_config/config.json');
const cmd_help = require('../../../src/assets/json/command_config/command_help.json');

const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { isMod } = require('../../../utils/functions/isMod');
const { checkMessage } = require('../../../utils/functions/checkMessage/checkMessage');
const { warnUser } = require('../../../utils/functions/moderations/warnUser');
const { log } = require('../../../logs');
const { removeMention } = require('../../../utils/functions/removeCharacters');

module.exports.run = async (bot, message, args) => {
    if(config.deleteCommandsAfterUsage == 'true') {
        message.delete().catch(err => {});
    }
    if (!await hasPermission(message, 0, 0)) {
         
        message.delete().catch(err => {});
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete().catch(err => {}), 5000);
        });
    }
    try {
        args[0] = removeMention(args[0]);

        var Member = await message.guild.members.fetch(args[0]);

        if(checkMessage(message, Member, bot, 'warn')) return message.reply(checkMessage(message, Member, bot, 'warn')).catch(err => {});
    }catch(err) {
        return message.reply(`I can't find this user!`).catch(err => {});
    }

    if (await isMod(Member, message)) return message.channel.send(`<@${message.author.id}> You can't warn a Moderator!`).catch(err => {}); 

    let reason = args.slice(1).join(" ");
    if (!reason) {
        return message.reply('Please add a reason!').catch(err => {});
    }
    
    return await warnUser(bot, config, message, Member, reason, log);
}

module.exports.help = cmd_help.moderation.warn;