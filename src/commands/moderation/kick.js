const config = require('../../../src/assets/json/_config/config.json');
const cmd_help = require('../../../src/assets/json/command_config/command_help.json');

const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { isMod } = require('../../../utils/functions/isMod');
const { checkMessage } = require('../../../utils/functions/checkMessage/checkMessage');
const { removeMention } = require('../../../utils/functions/removeCharacters');
const { kickUser } = require('../../../utils/functions/moderations/kickUser');

module.exports.run = async (bot, message, args) => {
    if (config.deleteModCommandsAfterUsage == 'true') {
        message.delete().catch(err => {});
    }

    if (!await hasPermission(message, 0, 0)) { 
        message.delete().catch(err => {});
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete().catch(err => {}), 5000);
        });
    }

    try {
        args[0] = removeMention(args[0])

        var Member = await message.guild.members.fetch(args[0]);
        
        if(checkMessage(message, Member, bot, 'kick')) {
            return message.reply(checkMessage(message, Member, bot, 'kick')).catch(err => {});
        }
    }catch(err) {
        return message.reply(`I can't find this user!`);
    }

    let reason = args.slice(1).join(" ");
    if (!reason) {
        return message.channel.send('Please add a reason!').catch(err => {});
    }

    if (await isMod(Member, message)) {
        return message.channel.send(`<@${message.author.id}> You can't kick a Moderator!`).catch(err => {});
    }


    return await kickUser(bot, Member, message, config, reason);
}

module.exports.help = cmd_help.moderation.kick;