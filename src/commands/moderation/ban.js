const {Permissions} = require('discord.js');
const config = require('../../../config.json');
const { getFutureDate } = require('../../../utils/functions/getFutureDate');
const { getModTime } = require('../../../utils/functions/getModTime');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { setNewModLogMessage } = require('../../../utils/modlog/modlog');
const { privateModResponse } = require('../../../utils/privatResponses/privateModResponses');
const { publicModResponses } = require('../../../utils/publicResponses/publicModResponses');
const { Database } = require('../../db/db');
const { isMod } = require('../../../utils/functions/isMod');

const database = new Database();

module.exports.run = async (bot, message, args) => {
    if(config.deleteModCommandsAfterUsage  == 'true') {
        message.delete();
    }

    if(!await hasPermission(message, 0, 1)) {
        message.delete();
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
    }
   
    try {
        var Member = message.mentions.members.first() || await message.guild.members.fetch(args[0]);
        if (!Member) return message.reply(`<@${message.author.id}> You have to mention a user`);
        if (Member.id === message.author.id) return message.reply(`You can't ban yourself.`);
        if (Member.id === bot.user.id) return message.reply(`You cant't ban me.`);
    }catch(err) {
        return message.reply(`I can't find this user!`);
    }

    if (await isMod(Member, message)) return message.channel.send(`<@${message.author.id}> You can't ban a Moderator!`)

    let x = 1;
    var time = args[x]

    while(time == '') {
        time = args[x];
        x++;
    }

    let dbtime = getModTime(time);
    if(!dbtime) return message.reply(`Invalid Time [m, h, d]`);

    let reason = args.slice(x).join(" ");
    reason = reason.replace(time, '');

    if(!reason) return message.channel.send('Please add a reason!');

    if(Member.user.bot) return message.reply(`You can't ban ${Member}! It's a bot!`);

    database.query(`SELECT * FROM open_infractions WHERE user_id = ? AND ban = 1`, [Member.id]).then(async result => {
        if (result.length > 0) {
            for (let i in result) {
                let currentdate = new Date().toLocaleString('de-DE', {timeZone: 'Europe/Berlin'})
                currentdate = currentdate.replace(',', '').replace(':', '').replace(' ', '').replace(':', '').replace('.', '').replace('.', '').replace('.', '');
                result[i].till_date = result[i].till_date.replace(',', '').replace(':', '').replace(' ', '').replace(':', '').replace('.', '').replace('.', '').replace('.', '');

                if ((currentdate - result[i].till_date) <= 0) {
                    return message.reply(`Member is already banned!`);
                }
            }
        }

        try {
            let infid = Math.random().toString(16).slice(2, 20);
            database.query(`INSERT INTO open_infractions (user_id, mod_id, ban, till_date, reason, infraction_id, guild_id) VALUES (?, ?, ?, ?, ?, ?, ?)`, [Member.id, message.author.id, 1, getFutureDate(dbtime), reason, infid, message.guild.id]).then(async () => {
                await setNewModLogMessage(bot, config.defaultModTypes.ban, message.author.id, Member.id, reason, time, message.guild.id);
                await publicModResponses(message, config.defaultModTypes.ban, message.author.id, Member.id, reason, time);
                await privateModResponse(Member, config.defaultModTypes.ban, reason, time);
                setTimeout(async () => {
                    if(config.debug == 'true') console.info('Ban Command passed!');
                    await Member.ban({reason: reason}).catch(err => {
                        message.channel.send(`I can't ban the user! Please check if my Permissions are correct!`);
                        database.query(`DELETE FROM open_infractions WHERE infraction_id = ?`, [infid]).catch(err => {
                            log.fatal(err);
                            if(config.debug == 'true') console.log(err);
                            return message.channel.send(`${config.errormessages.databasequeryerror}`); 
                        });
                    })
                }, 500);
            }).catch(err => {
                log.fatal(err);
                if(config.debug == 'true') console.log(err);
                return message.channel.send(`${config.errormessages.databasequeryerror}`); 
            })
        } catch (err) {
            log.fatal(err);
            if(config.debug == 'true') console.log(err);
            message.channel.send(config.errormessages.general)
        }
    }).catch(err => {
        log.fatal(err);
        if(config.debug == 'true') console.log(err);
        return message.channel.send(`${config.errormessages.databasequeryerror}`); 
    })

}

module.exports.help = {
    name:"ban",
    description: "Ban an User",
    usage: "ban <Mention User> <Reason>"
}