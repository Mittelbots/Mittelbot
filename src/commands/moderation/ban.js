const {Permissions, MessageEmbed} = require('discord.js');
const config = require('../../../config.json');
const { getFutureDate } = require('../../../utils/functions/getFutureDate');
const { getModTime } = require('../../../utils/functions/getModTime');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { database } = require('../../db/db');

module.exports.run = async (bot, message, args) => {
    if(config.deleteModCommandsAfterUsage  == 'true') {
        message.delete();
    }

    if(!hasPermission(message, 0, 1)) {
        message.delete();
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
    }
   
    let Member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!Member) return message.reply(`<@${message.author.id}> You have to mention a user`);
    if (Member.id === message.author.id) return message.reply(`You can't ban yourself.`);
    if (Member.id === bot.user.id) return message.reply(`You cant't ban me.`);

    let reason = args.slice(1).join(" ");
    if(!reason) return message.channel.send('Please add a reason!');




    if(Member.user.bot) message.reply(`Do you really want to ban <@${Member.user.id}>? It's a Bot.`).then(() => {      
        let msg_filter = m => m.author.id === message.author.id;
        message.channel.awaitMessages({filter: msg_filter, max: 1})
        .then(collected => {
            collected = collected.first();
            if(collected.content.toUpperCase() == 'YES' || collected.content.toUpperCase() == 'Y') {
                if(!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return message.reply(`You don't have the permission to ban a bot.`)
                try {
                    Member.ban({reason: reason});
                    return message.reply(`<@${Member.id}>${config.successmessages.banned}`);
                }catch(err) {
                    console.log(err);
                    return message.reply(`${config.errormessages.botnopermission}`);
                }

            }else if (collected.content.toUpperCase() == 'NO' || collected.content.toUpperCase() == 'N') {
                return message.channel.send(`Terminated`).then(msg => {
                    setTimeout(() => msg.delete(), 5000);
                });
            }else {
                return message.channel.send(`Terminated: Invalid Response`).then(msg => {
                    setTimeout(() => msg.delete(), 5000);
                });
            }
        });
    });  
    // If Member is not a bot //

    for(let i in config.modroles) {
        if(Member.roles.cache.find(r => r.name === config.modroles[i]) !== undefined) {
            return message.channel.send(`<@${message.author.id}> You can't ban a Moderator!`)
        }
    }

    let time = args.slice(2).join(" ");
    reason = reason.replace(time, '');
    var dbtime = getModTime(time);
    if(!dbtime) return message.reply(`Invalid Time [m, h, d]`);

    var futuredate = getFutureDate(dbtime);


    database.query(`SELECT * FROM open_infractions WHERE user_id = ? AND ban = 1`, [Member.id], async (err, result) => {
        if (err) {
            console.log(err);
            return message.reply(`${config.errormessages.databasequeryerror}`);
        }
        if (result.length > 0) {
            for (let i in result) {
                let currentdate = new Date().toLocaleString('de-DE', {timeZone: 'Europe/Berlin'})
                currentdate = currentdate.replace(',', '').replace(':', '').replace(' ', '').replace(':', '').replace('.', '').replace('.', '').replace('.', '');
                result[i].till_date = result[i].till_date.replace(',', '').replace(':', '').replace(' ', '').replace(':', '').replace('.', '').replace('.', '').replace('.', '');

                if ((currentdate - result[i].till_date) <= 0) {
                    return message.reply(`Member Is Already banned!`);
                }
            }
        }

        var Embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`**Member Banned!**`)
            .addField(`Moderator`, `<@${message.author.id}> (${message.author.id})`)
            .addField(`Member`, `<@${Member.user.id}> (${Member.user.id})`)
            .addField(`Reason`, `${reason || "No Reason Provided!"}`)
            .addField(`Time`, `**${time}** `)
            .setTimestamp();

        try {
            database.query(`INSERT INTO open_infractions (user_id, mod_id, ban, till_date, reason, infraction_id) VALUES (?, ?, ?, ?, ?, ?)`, [Member.id, message.author.id, 1, futuredate, reason, Math.random().toString(16).substr(2, 20)], async (err) => {
                if(err) {
                    console.log(err);
                    return message.reply(`${config.errormessages.databasequeryerror}`);
                }
                await Member.send({embeds: [Embed]});
                await message.reply(`<@${Member.id}>${config.successmessages.banned} `);
                await Member.ban({reason: reason});
                return message.channel.send({
                    embeds: [Embed]
                });
            });
        } catch (err) {
            console.log(err);
            message.channel.send(config.errormessages.general)
        }

    });

}

module.exports.help = {
    name:"ban",
    description: "Ban an User",
    usage: "ban <Mention User> <Reason>"
}