const {
    Permissions,
    MessageEmbed
} = require('discord.js');
const config = require('../../../config.json');
const { createInfractionId } = require('../../../utils/functions/createInfractionId');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const { insertDataToClosedInfraction } = require('../../../utils/functions/insertDataToDatabase');
const { database } = require('../../db/db');

module.exports.run = async (bot, message, args) => {
    if (config.deleteModCommandsAfterUsage == 'true') {
        message.delete();
    }

    if (!hasPermission(message, 0, 0)) {
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
    }

    let Member = message.mentions.members.first() || await message.guild.members.fetch(args[0]);
    if (!Member) return message.reply(`<@${message.author.id}> You have to mention a user`);
    if (Member.id === message.author.id) return message.reply(`You can't kick yourself.`);
    if (Member.id === bot.user.id) return message.reply(`You cant't ban me.`);

    let reason = args.slice(1).join(" ");
    if (!reason) return message.channel.send('Please add a reason!');


    if (Member.user.bot) message.reply(`Do you really want to kick <@${Member.user.id}>? It's a Bot.`).then(() => {
        let msg_filter = m => m.author.id === message.author.id;
        message.channel.awaitMessages({
                filter: msg_filter,
                max: 1
            })
            .then(collected => {
                collected = collected.first();
                if (collected.content.toUpperCase() == 'YES' || collected.content.toUpperCase() == 'Y') {
                    if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) return message.reply(`You don't have the permission to ban a bot.`)
                    try {
                        Member.kick({
                            reason: reason
                        });
                        return message.reply(`<@${Member.id}>${config.successmessages.kicked}`);
                    } catch (err) {
                        console.log(err);
                        return message.reply(`${config.errormessages.botnopermission}`);
                    }

                } else if (collected.content.toUpperCase() == 'NO' || collected.content.toUpperCase() == 'N') {
                    return message.channel.send(`Terminated`).then(msg => {
                        setTimeout(() => msg.delete(), 5000);
                    });
                } else {
                    return message.channel.send(`Terminated: Invalid Response`).then(msg => {
                        setTimeout(() => msg.delete(), 5000);
                    });
                }
            });
    });
    // If Member is not a bot //

    let isMod = false;
    for (let i in config.modroles) {
        if (Member.roles.cache.find(r => r.name === config.modroles[i]) !== undefined) {
            isMod = true;
            break;
        }
    }
    if (isMod) return message.channel.send(`<@${message.author.id}> You can't ban a Moderator!`)

    var Embed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`**Member kicked!**`)
        .addField(`Moderator`, `<@${message.author.id}> (${message.author.id})`)
        .addField(`Kicked Member`, `<@${Member.user.id}> (${Member.user.id})`)
        .addField(`Reason`, `${reason || "No Reason Provided!"}`)
        .setTimestamp();

    try {
        insertDataToClosedInfraction(Member.id, message.author.id, 0, 0, 0, 1, null, reason, createInfractionId())
        await Member.send({embeds: [Embed]});
        await message.reply(`<@${Member.id}>${config.successmessages.kicked} `)
        await Member.kick({
            reason: reason
        });;
        return message.channel.send({
            embeds: [Embed]
        })
    } catch (err) {
        console.log(err);
        return message.reply(`${config.errormessages.botnopermission}`);
    }
}

module.exports.help = {
    name: "kick",
    description: "Kick an User",
    usage: "kick <Mention User> <Reason>"
}