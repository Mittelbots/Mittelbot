const {
    MessageEmbed
} = require('discord.js');
const config = require('../../../src/assets/json/_config/config.json');
const cmd_help = require('../../../src/assets/json/command_config/command_help.json');
const database = require('../../db/db');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const { log } = require('../../../logs');


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

    function convertDateToDiscordTimestamp(date) {
        let converteDate = new Intl.DateTimeFormat('de-DE').format(date)
        converteDate = converteDate.split('.');
        converteDate = new Date(converteDate[2], converteDate[1] - 1, converteDate[0]);

        return Math.floor(converteDate/1000);
    }

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
        .addField(`Created At`, `${new Intl.DateTimeFormat('de-DE').format(server.createdAt)} \n<t:${convertDateToDiscordTimestamp(server.createdAt)}:R>`, true)
        .addField('\u200B', '\u200B')
        .setTimestamp();

    if(tag) {
        var joined_at = await database.query(`SELECT user_joined FROM ${message.guild.id}_guild_member_info WHERE user_id = ?`, [user.id]).then(async res => {
            if(res.length === 0) return false;
            return await res[0].user_joined
        }).catch(err => {
            errorhandler(err, config.errormessages.databasequeryerror, message.channel, log, config, true);
            return false
        })
    }

    
    const memberInfoEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`**Memberinfos - ${user.username}#${user.discriminator}**`)
        .addField(`Tag/ID: `, `<@${user.id}>/${user.id}`)
        .addField(`Created at`, `${new Intl.DateTimeFormat('de-DE').format(user.createdAt)} \n<t:${convertDateToDiscordTimestamp(user.createdAt)}:R>`, true)
        .addField(`Last Joined at`, `${new Intl.DateTimeFormat('de-DE').format(server.members.cache.find(member => member.id === user.id).joinedAt)} \n<t:${convertDateToDiscordTimestamp(server.members.cache.find(member => member.id === user.id).joinedAt)}:R>`, true)
        .addField(`First Joined at`, `${(!joined_at) ? 'Not saved in Database' : new Intl.DateTimeFormat('de-DE').format(new Date(joined_at.slice(0,9)))} ${(joined_at) ? ` \n<t:${Math.floor(new Date(joined_at.slice(0,9))/1000)}:R>` : ''}`, true)
        .addField(`Roles`, `${userRole}`)
        .addField('\u200B', '\u200B')
        .setTimestamp();

        if(config.debug == 'true') console.info('info command passed!')
    if(!tag) {
        return message.channel.send({
            embeds: [serverInfoEmbed]
        }).catch(err => {
            return errorhandler(err, config.errormessages.nopermissions.sendEmbedMessages, message.channel, log, config);
        });
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
    }).catch(err => {
        return errorhandler(err, config.errormessages.nopermissions.sendEmbedMessages, message.channel, log, config);
    });
}

module.exports.help = cmd_help.utility.info