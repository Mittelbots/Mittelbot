const {Permissions, MessageEmbed} = require('discord.js');
const config = require('../../../config.json');

module.exports.run = async (bot, message, args) => {
    if(config.deleteModCommandsAfterUsage  == 'true') {
        message.delete();
    }

    var hasPermission = false
    for(let i in config.modroles) {
        if(i == "trialmoderator") continue;

        if(message.member.roles.cache.find(r => r.name === config.modroles[i]) !== undefined) {
            hasPermission = true;
            break;
        }
    }
    if(!hasPermission) {
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

    let isMod = false;
    for(let i in config.modroles) {
        if(Member.roles.cache.find(r => r.name === config.modroles[i]) !== undefined) {
            isMod = true;
            break;
        }
    }

    if(isMod) return message.channel.send(`<@${message.author.id}> You can't ban a Moderator!`)


    var Embed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle(`**Member Banned!**`)
    .addField(`Moderator`, `<@${message.author.id}> (${message.author.id})`)
    .addField(`Banned Member`, `<@${Member.user.id}> (${Member.user.id})`)
    .addField(`Reason`, `${reason || "No Reason Provided!"}`)
    .setTimestamp();

    try {
        Member.ban({reason: reason});
        message.reply(`<@${Member.id}>${config.successmessages.banned} `);
        return message.channel.send({embeds: [Embed]})
    }catch(err) {
        console.log(err);
        return message.reply(`${config.errormessages.botnopermission}`);
    }

}

module.exports.help = {
    name:"ban",
    description: "Ban an User",
    usage: "ban <Mention User> <Reason>"
}