const {
    MessageEmbed,
    Permissions
} = require('discord.js');
const config = require('../../../config.json');

module.exports.run = async (bot, message, args) => {
    if (config.deleteModCommandsAfterUsage == 'true') {
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

    if(Member.user.bot) return message.channel.send(`You can't mute <@${Member.user.id}>. It's a Bot.`)

    let isMod = false;
    for(let i in config.modroles) {
        if(Member.roles.cache.find(r => r.name === config.modroles[i]) !== undefined) {
            isMod = true;
            break;
        }
    }

    if(isMod) return message.channel.send(`<@${message.author.id}> You can't mute a Moderator!`)

    var MutedRole;

    try {
        MutedRole = message.guild.roles.cache.find(role => role.name === "Muted").id;
    }catch(err) {
        message.channel.send(`No Mutedrole detected! I'll create one for you.`);
        MutedRole = await message.guild.roles.create({
            name: 'Muted',
            color: 'BLUE',
            reason: 'Automatically created "Muted" Role.'
        });
        message.channel.send(`Role created!`);   
    }

    let reason = args.slice(1).join(" ");
    if(!reason) return message.channel.send('Please add a reason!');

    let time = args.slice(2).join(" ");
    function isNum(val){
        return !isNaN(val)
      }
    if(!isNum(time)) return message.channel.send('Time have to be a number!'); else message.channel.send('Tempmute is under construction')

    if (Member.roles.cache.has(MutedRole)) {
        return message.channel.send(`Member Is Already Muted!`);
    }



    var Embed = new MessageEmbed()
    .setColor('#0099ff')
    .setTitle(`**Member Muted!**`)
    .addField(`Moderator`, `<@${message.author.id}> (${message.author.id})`)
    .addField(`Muted Member`, `<@${Member.user.id}> (${Member.user.id})`)
    .addField(`Reason`, `${reason || "No Reason Provided!"}`)
    .addField(`Time`, `${time || "No Time Provided!"}`)
    .setTimestamp();

    try {
        Member.roles.add([MutedRole]);
        return message.channel.send({embeds: [Embed]});
    }
    catch(err) {
        console.log(err);
        message.channel.send(config.errormessages.general)
    }
}

module.exports.help = {
    name: "mute",
    description: "Mute a User",
    usage: "Mute <Mention User> <Reason>"
}