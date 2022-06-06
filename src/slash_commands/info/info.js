const {
    SlashCommandBuilder
} = require('@discordjs/builders');
const {
    MessageEmbed
} = require('discord.js');
const database = require('../../db/db');
const { errorhandler } = require('../../../utils/functions/errorhandler/errorhandler');
const { log } = require('../../../logs');
const os = require('os');
const { version } = require('../../../package.json');
var os_utils = require('os-utils');

const config = require('../../../src/assets/json/_config/config.json');

module.exports.run = async ({main_interaction, bot}) => {
    let server = main_interaction.guild;

    const userOption = main_interaction.options.getUser('user');
    const isAnonym = main_interaction.options.getBoolean('anonymous');

    const tag = (userOption) ? true : false;

    var user = userOption || main_interaction.user;

    var userRole = '';

    server.roles.cache.forEach(role => {
        let searchedRole = server.roles.cache.get(role.id).members.map(m => m.user.id).filter(m => m === user.id)

        if (userRole.includes(searchedRole) || server.roles.cache.get(role.id).name === '@everyone' || server.roles.cache.get(role.id).name === bot.user.username) return;

        if (searchedRole.filter(e => e === user.id)) {
            userRole += ` <@&${server.roles.cache.get(role.id).id}> `;
        }
    });

    if(userRole == '') userRole = 'No Roles';

    function convertDateToDiscordTimestamp(date) {
        let converteDate = new Intl.DateTimeFormat('de-DE').format(date)
        converteDate = converteDate.split('.');
        converteDate = new Date(converteDate[2], converteDate[1] - 1, converteDate[0]);

        return Math.floor(converteDate/1000);
    }

    function format(seconds){
        function pad(s){
          return (s < 10 ? '0' : '') + s;
        }
        var hours = Math.floor(seconds / (60*60));
        var minutes = Math.floor(seconds % (60*60) / 60);
        var seconds = Math.floor(seconds % 60);
      
        return pad(hours) + ':' + pad(minutes) + ':' + pad(seconds);
      }
      
      var uptime = process.uptime();

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
        .addField('BOT INFORMATIONS', 'Everything you need to know about the bot.')
        .addField('Bot Uptime', format(uptime), true)
        .addField('Memory usage', JSON.stringify(os.totalmem()), true)
        .addField('Bot Version', version.toString(), true)
        .addField('\u200B', '\u200B')
        .setTimestamp();
    if(tag) {
        var joined_at = await database.query(`SELECT user_joined FROM ${server.id}_guild_member_info WHERE user_id = ?`, [user.id]).then(async res => {
            if(res.length === 0) return false;
            return await res[0].user_joined
        }).catch(err => {
            errorhandler(err, config.errormessages.databasequeryerror, main_interaction.channel, log, config, true);
            return false
        })
    }
    var dc_joinedAt;
    try {
        dc_joinedAt = new Intl.DateTimeFormat('de-DE').format(server.members.cache.find(member => member.id === user.id).joinedAt) + `\n<t:${convertDateToDiscordTimestamp(server.members.cache.find(member => member.id === user.id).joinedAt)}:R>`;
    }catch(err) {
        dc_joinedAt = 'Not in this server';
    }
    
    const memberInfoEmbed = new MessageEmbed()
        .setColor('#0099ff')
        .setTitle(`**Memberinfos - ${user.username}#${user.discriminator}**`)
        .addField(`Tag/ID: `, `<@${user.id}>/${user.id}`)
        .addField(`Created at`, `${new Intl.DateTimeFormat('de-DE').format(user.createdAt)} \n<t:${convertDateToDiscordTimestamp(user.createdAt)}:R>`, true)
        .addField(`Last Joined at`, dc_joinedAt, true)
        .addField(`First Joined at`, `${(!joined_at) ? 'Not saved in Database' : new Intl.DateTimeFormat('de-DE').format(new Date(joined_at.slice(0,9)))} ${(joined_at) ? ` \n<t:${Math.floor(new Date(joined_at.slice(0,9))/1000)}:R>` : ''}`, true)
        .addField(`Roles`, `${userRole}`)
        .addField('\u200B', '\u200B')
        .setTimestamp();

        if(config.debug == 'true') console.info('info command passed!')
    if(!tag) {
        return main_interaction.reply({
            embeds: [serverInfoEmbed],
            ephemeral: true
        }).catch(err => {
            return errorhandler(err, config.errormessages.nopermissions.sendEmbedMessages, main_interaction.channel, log, config);
        });
    }

    const axios = require('axios');
    let pfp = axios.get(`https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.gif?size=4096`).then(() => {
        return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.gif?size=4096`
    }).catch(() => {
        return `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=4096`
    });

    memberInfoEmbed.setThumbnail(await pfp);
    return main_interaction.reply({
        embeds: [memberInfoEmbed],
        ephemeral: (isAnonym) ? true : false
    }).catch(err => {
        return errorhandler(err, config.errormessages.nopermissions.sendEmbedMessages, main_interaction.channel, log, config);
    });
}

module.exports.data = new SlashCommandBuilder()
	.setName('info')
	.setDescription('Get information about yourself or another user')
    .addUserOption(option => 
        option.setName('user')
        .setDescription('The user to get information about')
        .setRequired(false)
        )
    .addBooleanOption(option =>
        option.setName('anonymous')
        .setDescription('Set this to true if you want to hide the response from the user')
        .setRequired(false)
        )