const { MessageEmbed } = require('discord.js');
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

    let Member = args[0];
    if (!Member) return message.reply(`<@${message.author.id}> You have to mention a user`);
    Member = Member.replace('<', '');
    Member = Member.replace('@', '');
    Member = Member.replace('!', '');
    Member = Member.replace('>', '');

    let reason = args.slice(1).join(" ");
    if(!reason) return message.channel.send('Please add a reason!');

    var Embed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle(`**Member Unbanned!**`)
    .addField(`Moderator`, `<@${message.author.id}> (${message.author.id})`)
    .addField(`Unanned Member`, `<@${Member}> (${Member})`)
    .addField(`Reason`, `${reason || "No Reason Provided!"}`)
    .setTimestamp();

    try {
        await message.guild.members.unban(`${Member}`, `${reason}`)
        // bot.users.fetch(Member, false).then((user) => user.send({embeds: [Embed]}).catch((err) => console.log(err)));
    }catch(err) {
        return await message.reply(`The User is not banned.`);
    }


    return await message.channel.send({embeds: [Embed]});
}

module.exports.help = {
    name:"unban",
    description: "Unban an User",
    usage: "unban <Mention User> <Reason>"
}