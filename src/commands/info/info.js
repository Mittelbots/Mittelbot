const {
    MessageEmbed
} = require('discord.js');
const config = require('../../../src/assets/json/_config/config.json');
const database = require('../../db/db')


module.exports.run = async (bot, message, args) => {
    if(config.deleteCommandsAfterUsage  == 'true') {
        message.delete().catch(err => {});
    }
    let server = message.guild;

    var user;
    let tag = false;
    if(args.length !== 0) {
        args = args.join(" ").replace('<', '').replace('@', '').replace('>', '').replace('!', '')
        try {
            user = message.guild.members.cache.find(member => member.id.includes(args)).user;
        }catch(err) {
            return message.reply('Member not found!').catch(err => {});
        }
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
        .setDescription(`${server.id}`)
        .addField(`Owner: `, `<@${server.ownerId}>`, true)
        .addField(`Channels`, `${server.channels.cache.size}`, true)
        .addField(`Members`, `${server.members.cache.size}`, true)
        .addField(`Roles`, `${server.roles.cache.size}`, true)
        .addField(`Created At`, `${new Intl.DateTimeFormat('de-DE').format(server.createdAt)} CET`, true)
        .addField('\u200B', '\u200B')
        .setTimestamp();

    if(tag) {
        var joined_at = await database.query(`SELECT user_joined FROM ${message.guild.id}_guild_member_info WHERE user_id = ?`, [user.id]).then(async res => {
            return await res[0].user_joined
        }).catch(err => {
            return false
        })
    }
    
    const memberInfoEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`**Memberinfos - ${user.username}**`)
        .addField(`Tag/ID: `, `<@${user.id}>/${user.id}`)
        .addField(`Created at`, `${new Intl.DateTimeFormat('de-DE').format(user.createdAt)} CET`, true)
        .addField(`Last Joined at`, `${new Intl.DateTimeFormat('de-DE').format(message.member.createdAt)} CET`, true)
        .addField(`First Joined at`, `${(!joined_at) ? 'Not saved in Database' : new Intl.DateTimeFormat('de-DE').format(new Date(joined_at.slice(0,9)))} ${(joined_at != '') ? 'CET' : ''}`, true)
        .addField(`Roles`, `${userRole}`)
        .addField('\u200B', '\u200B')
        .setTimestamp();

        if(config.debug == 'true') console.info('info command passed!')
    if(!tag) {
        return message.channel.send({
            embeds: [serverInfoEmbed]
        }).catch(err => {});
    }

    const axios = require('axios');
    let pfp = axios.get(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.gif?size=4096`).then(() => {
        return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.gif?size=4096`
    }).catch(() => {
        return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=4096`
    });

    memberInfoEmbed.setThumbnail(await pfp);
    return message.channel.send({
        embeds: [memberInfoEmbed]
    }).catch(err => {});
}

module.exports.help = config.commandhelp.info