const config = require('../../../config.json');
const { createInfractionId } = require('../../../utils/functions/createInfractionId');
const { getFutureDate } = require('../../../utils/functions/getFutureDate');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { insertDataToClosedInfraction, inserDataToTemproles } = require('../../../utils/functions/insertDataToDatabase');
const { setNewModLogMessage } = require('../../../utils/modlog/modlog');
const { privateModResponse } = require('../../../utils/privatResponses/privateModResponses');
const { publicModResponses } = require('../../../utils/publicResponses/publicModResponses');
const { Database } = require('../../db/db');
const { isMod } = require('../../../utils/functions/isMod');

module.exports.run = async (bot, message, args) => {
    if(config.deleteCommandsAfterUsage == 'true') {
        message.delete();
    }
    if (!await hasPermission(message, 0, 0)) {
        message.delete();
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
    }
    try {
        var Member = message.mentions.members.first() || await message.guild.members.fetch(args[0]);
        if (!Member) return message.reply(`<@${message.author.id}> You have to mention a user`);
        if (Member.user.bot) return message.reply(`You can't warn <@${Member.user.id}>. It's a Bot.`)
        if (Member.id === bot.user.id) return message.reply(`You cant't warn me.`);
        if (Member.id === message.author.id) return message.reply(`You cant't warn yourself.`);
    }catch(err) {
        message.delete();
        return message.channel.send(`Please mention an user!`).then(msg => setTimeout(() => msg.delete(), 5000));
    }

    if (await isMod(Member, message)) return message.channel.send(`<@${message.author.id}> You can't warn a Moderator!`) 

    let reason = args.slice(1).join(" ");
    if (!reason) return message.reply('Please add a reason!');

    try {

        setNewModLogMessage(bot, config.defaultModTypes.warn, message.author.id, Member.user.id, reason, null, message.guild.id);
        publicModResponses(message, config.defaultModTypes.warn, message.author.id, Member.user.id, reason);
        privateModResponse(Member, config.defaultModTypes.warn, reason);

        let inf_id = createInfractionId()

        insertDataToClosedInfraction(Member.id, message.author.id, 0, 0, 1, 0, null, reason, inf_id);
        if(config.debug == 'true') console.info('Warn Command passed!')

        const database = new Database();
        database.query(`SELECT role_id FROM ${message.guild.id}_guild_warnroles`).then(async res => {
            if(res.length > 0) {   

                for(let i in res) {
                    let role = await message.guild.roles.cache.find(role => role.id === res[i].role_id).id
                    if(!Member.roles.cache.has(role)) {
                        Member.roles.add([role]);
                        return inserDataToTemproles(Member.id, res[i].role_id, getFutureDate(2678400), inf_id);
                    }
                }
                //If User already have both Roles
                return message.reply(`The User already have both warn roles!`);
            }
            return;
        }).catch(err => console.log(err))


    }catch(err) {
        console.log(err);
        message.reply(config.errormessages.general)
    }
}

module.exports.help = {
    name:"warn"
}