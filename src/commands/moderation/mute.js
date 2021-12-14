const {
    MessageEmbed
} = require('discord.js');
const config = require('../../../config.json');

const ms = require('ms');
const {
    database
} = require('../../db/db');
const { getModTime } = require('../../../utils/functions/getModTime');
const { getFutureDate } = require('../../../utils/functions/getFutureDate');

module.exports.run = async (bot, message, args) => {
    if (config.deleteModCommandsAfterUsage == 'true') {
        message.delete();
    }

    var hasPermission = false
    for (let i in config.modroles) {
        if (message.member.roles.cache.find(r => r.name === config.modroles[i]) !== undefined) {
            hasPermission = true;
            break;
        }
    }
    if (!hasPermission) {
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
    }

    let Member = message.mentions.members.first() || message.guild.members.cache.get(args[0]);
    if (!Member) return message.channel.send(`<@${message.author.id}> You have to mention a user`);
    if (Member.user.bot) return message.reply(`You can't mute <@${Member.user.id}>. It's a Bot.`)
    if (Member.id === bot.user.id) return message.reply(`You cant't mute me.`);

    for (let i in config.modroles) {
        if (Member.roles.cache.find(r => r.name === config.modroles[i]) !== undefined) {
            return message.channel.send(`<@${message.author.id}> You can't mute a Moderator!`)
        }
    }

    var MutedRole;

    try {
        MutedRole = await message.guild.roles.cache.find(role => role.name === "Muted").id;
    } catch (err) {
        await message.channel.send(`No Mutedrole detected! I'll create one for you.`);
        MutedRole = await message.guild.roles.create({
            name: 'Muted',
            color: 'BLUE',
            reason: 'Automatically created "Muted" Role.',
            permissions: []
        });
        await message.guild.channels.cache.map(async channel => {
            await channel.permissionOverwrites.create(MutedRole, {
                VIEW_CHANNEL: false,
                SEND_MESSAGES: false,
                ADD_REACTIONS: false,
                SPEAK: false,
                CONNECT: false
            });
        });
        await message.channel.send(`Role created!`);
    }

    if (Member.roles.cache.has(MutedRole)) return message.channel.send(`Member Is Already Muted!`)

    let reason = args.slice(1).join(" ");
    if (!reason) return message.channel.send('Please add a reason!');
    reason = reason.replace(time, '');

    let time = args.slice(2).join(" ");
    dbtime = getModTime(time);
    if(!dbtime) return message.reply(`Invalid Time [m, h, d]`);


    var futuredate = getFutureDate(dbtime, time)


    database.query(`SELECT * FROM open_infractions WHERE user_id = ? AND mute = 1`, [Member.id], async (err, result) => {
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
                    return message.reply(`Member Is Already Muted!`);
                }
            }
        }

        var Embed = new MessageEmbed()
            .setColor('#0099ff')
            .setTitle(`**Member Muted!**`)
            .addField(`Moderator`, `<@${message.author.id}> (${message.author.id})`)
            .addField(`Member`, `<@${Member.user.id}> (${Member.user.id})`)
            .addField(`Reason`, `${reason || "No Reason Provided!"}`)
            .addField(`Till`, `${futuredate}`)
            .setTimestamp();

        try {
            database.query(`INSERT INTO open_infractions (user_id, mod_id, mute, till_date, reason, infraction_id) VALUES (?, ?, ?, ?, ?, ?)`, [Member.id, message.author.id, 1, futuredate, reason, Math.random().toString(16).substr(2, 20)], (err) => {
                if(err) {
                    console.log(err);
                    return message.reply(`${config.errormessages.databasequeryerror}`);
                }
                Member.roles.add([MutedRole]);
                Member.send({embeds: [Embed]});
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
    name: "mute",
    description: "Mute a User",
    usage: "Mute <Mention User> <Reason>"
}