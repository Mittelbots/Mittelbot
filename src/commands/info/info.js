const {
    MessageEmbed
} = require('discord.js');
const config = require('../../../config.json');

module.exports.run = async (bot, message, args) => {
    if(config.deleteCommandsAfterUsage  == 'true') {
        message.delete();
    }
    let server = message.guild;

    var user;
    let tag = false;
    if(args.length !== 0) {
        args = args.join(" ").replace('<', '').replace('@', '').replace('>', '').replace('!', '')
        user = message.guild.members.cache.find(member => member.id.includes(args)).user;
        tag = true;
    }else {
        user = message.author
    }

    var userRole = '';

    message.guild.roles.cache.forEach(role => {
        let searchedRole = message.guild.roles.cache.get(role.id).members.map(m => m.user.id).filter(m => m === user.id)

        if (userRole.includes(searchedRole) || message.guild.roles.cache.get(role.id).name === '@everyone' || message.guild.roles.cache.get(role.id).name === bot.user.username) return;

        if (searchedRole.filter(e => e === user.id)) {
            userRole += ` <@&${message.guild.roles.cache.get(role.id).id}> `;
        }
    });

    if(userRole == '') userRole = 'No Roles';

    const serverInfoEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`**Serverinfos - ${server.name}**`)
        .setURL('https://discord.gg/chilledsad/')
        .setThumbnail(server.iconURL())
        .addField(`Owner: `, `<@${server.ownerId}>`, true)
        .addField(`Channels`, `${server.channels.cache.size}`, true)
        .addField(`Members`, `${server.members.cache.size}`, true)
        .addField(`Roles`, `${server.roles.cache.size}`, true)
        .addField(`Created At`, `${new Intl.DateTimeFormat('de-DE').format(server.createdAt)}`, true)
        .addField('\u200B', '\u200B')
        .setTimestamp();

    const memberInfoEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`**Memberinfos - ${user.username}**`)
        .setThumbnail(user.avatarURL())
        .addField(`Tag/ID: `, `<@${user.id}>/${user.id}`)
        .addField(`Created at`, `${new Intl.DateTimeFormat('de-DE').format(user.createdAt)}`, true)
        .addField(`Joined at`, `${new Intl.DateTimeFormat('de-DE').format(message.member.createdAt)}`)
        .addField(`Your roles`, `${userRole}`, true)
        .addField('\u200B', '\u200B')
        .setTimestamp();

        if(config.debug == 'true') console.info('info command passed!')
    if(!tag) {
        return message.channel.send({
            embeds: [serverInfoEmbed]
        });
    }
    return message.channel.send({
        embeds: [memberInfoEmbed]
    });
}

module.exports.help = {
    name: "info",
}