const { formatEmoji } = require('@discordjs/builders');
const { MessageEmbed } = require('discord.js');
const {Permissions} = require('discord.js');
const config = require('../../../config.json');

module.exports.run = async (bot, message, args) => {
    if(config.deleteModCommandsAfterUsage  == 'true') {
        message.delete();
    }

    var hasPermission = false
    for(let i in config.modroles) {
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

    if (!Member) return message.channel.send(`<@${message.author.id}> You have to mention a user`);

    var MutedRole = message.guild.roles.cache.find(role => role.name === "Muted").id
    
    if(!Member.roles.cache.has(MutedRole)) return message.channel.send(`<@${message.author.id}> The user isnt't muted.`)
    
    let reason = args.slice(1).join(" ");

    var Embed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle(`**Member Unmuted!**`)
    .addField(`Moderator`, `<@${message.author.id}> (${message.author.id})`)
    .addField(`Member`, `<@${Member.user.id}> (${Member.user.id})`)
    .addField(`Reason`, `${reason || "No Reason Provided!"}`)
    .setTimestamp();

    try {
        Member.send({embeds: [Embed]});
        Member.roles.remove([MutedRole]);
        return message.channel.send({embeds: [Embed]});
    }
    catch(err) {
        console.log(err);
        message.channel.send(config.errormessages.general)
    }

}

module.exports.help = {
    name:"unmute"
}