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

    if (isMod(Member, message)) return message.channel.send(`<@${message.author.id}> You warn kick a Moderator!`) 

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
        database.query(`SELECT autoroles FROM ${message.guild.id}_config LIMIT 1`).then(async res => {
            if(res[0].autoroles == 1) {   
                let warn1 = await message.guild.roles.cache.find(role => role.name === "Warn1").id
                let warn2 = await message.guild.roles.cache.find(role => role.name === "Warn2").id

                if(!Member.roles.cache.has(warn1)) { 
                    Member.roles.add([warn1]); 
                    return inserDataToTemproles(Member.id, warn1, getFutureDate(2678400), inf_id)
                }
                if(!Member.roles.cache.has(warn2)) {
                    Member.roles.add([warn2]); 
                    return inserDataToTemproles(Member.id, warn2, getFutureDate(2678400), inf_id)
                };
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