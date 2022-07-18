const {EmbedBuilder} = require('discord.js');
const config = require('../../src/assets/json/_config/config.json');
const ignorechannel = require('../../src/assets/json/ignorechannel/ignorechannel.json');
const database = require('../../src/db/db');
const { isOnBanList } = require('../functions/moderations/checkOpenInfractions');
const { getFromCache } = require('../functions/cache/cache');
const { setNewModLogMessage } = require('../modlog/modlog');


var c = config.auditTypes;
var gid = '';

function auditLog(bot) {

    bot.on(c.messagedelete, message => sendToAudit(bot, c.messagedelete, message));

    bot.on(c.channelcreate, channel => sendToAudit(bot, c.channelcreate, channel));

    bot.on(c.channeldelete, channel => sendToAudit(bot, c.channeldelete, channel));

    bot.on(c.channelupdate, (oldchannel, newchannel) => sendToAudit(bot, c.channelupdate, oldchannel, newchannel));

    bot.on(c.debug, info => sendToAudit(bot, c.debug, info));

    bot.on(c.disconnect, event => sendToAudit(bot, c.debug, event));

    bot.on(c.reconnecting, event => sendToAudit(bot, c.reconnecting, event));

    bot.on(c.error, err => sendToAudit(bot, c.error, err));

    bot.on(c.warn, warn => sendToAudit(bot, c.warn, warn));

    bot.on(c.guildupdate, (oldguild, newguild) => sendToAudit(bot, c.guildupdate, oldguild, newguild));

    bot.on(c.messagedeletebulk, messages => sendToAudit(bot, c.messagedeletebulk, messages));

    bot.on(c.messageupdate, (oldmessage, newmessage) => sendToAudit(bot, c.messageupdate, oldmessage, newmessage));

    bot.on(c.rolecreate, role => sendToAudit(bot, c.rolecreate, role));

    //bot.on(c.roleupdate, (oldrole, newrole) => sendToAudit(bot, c.roleupdate, oldrole, newrole));

    bot.on(c.roledelete, role => sendToAudit(bot, c.roledelete, role));

    bot.on(c.guildBanAdd, (guild, user) => sendToAudit(bot, c.guildBanAdd, guild, user));

    bot.on(c.guildBanRemove, (guild, user) => sendToAudit(bot, c.guildBanRemove, guild, user));
}

async function sendToAudit(bot, type, content1, content2) {
    if(ignorechannel.c.indexOf(content1.channelId) !== -1) return;

    var Message = new EmbedBuilder()
    .setTimestamp()

    function isOnWhitelist() {
        const cache = await getFromCache({
            cacheName: 'logs',
            param_id: content1.guild.id
        })
        if(cache) {
            var whitelist = JSON.parse(cache[0].whitelist) || [];

            if(whitelist.length > 0) {
                var userRoles = content1.member.roles.cache.map(role => role.id);
                

                var isOnWhitelist = whitelist.filter(function(item) {
                    return userRoles.indexOf(item) > -1;
                });

                if(isOnWhitelist.length > 0) {
                    return true;
                }else {
                    return false;
                }
            }
        }
    }

    switch(type) {

        case c.debug:
            Message.setDescription(`**Debug info: ** \n ${content1}`);
            break;

        case c.disconnect:
            Message.setDescription(`**WebSocket disconnected! ** \n ${content1}`);
            break;
        
        case c.reconnecting:
            Message.setDescription(`**WebSocket reconnecting! ** \n ${content1}`);
            break;

        case c.error:
            Message.setDescription(`**ERROR ** \n ${content1}`);
            break;

        case c.warn:
            Message.setDescription(`**WARN ** \n ${content1}`);
            break;


        case c.messagedeletebulk:
            if (!content1.guild) return
            if (content1.author.bot) return;

            gid = content1.guildId
            Message.setColor('#fc0509');
            Message.setThumbnail(content1.author.avatarURL({ format: 'jpg' }))
            Message.setAuthor({name: content1.author.username + ' '+content1.author.discriminator, icon_url: content1.author.avatarURL({ format: 'jpg' })})
            Message.setDescription(`**Bulkmessages sent by <@${content1.author.id}> deleted in <#${content1.channelId}>** \n${content1}`);
            Message.setFooter({text: `Author: ${content1.author.id} | MessageID: ${content1.id}`});
            break;

        case c.messagedelete:
            if (!content1.guild) return
            if (content1.author.id === bot.user.id) return;
            if (content1.author.bot) return;
            if (content1.system) return;

            if(isOnWhitelist()) return;
            
            gid = content1.guildId;
            
            const attachment = content1.attachments.first();

            Message.setColor('#fc0509');
            Message.setThumbnail(content1.author.avatarURL({ format: 'jpg' }))
            Message.setAuthor({name: content1.author.username + ' '+content1.author.discriminator, icon_url: content1.author.avatarURL({ format: 'jpg' })})
            Message.setDescription(`**Message sent by <@${content1.author.id}> deleted in <#${content1.channelId}>** \n${(attachment !== undefined) ? '' : content1}`);
            if(content1.stickers.size > 1) { 
                Message.addFields([
                    {name: 'Stickers', value: content1.stickers.map(s => s.url).join('\n')}
                ]);
            }
            if(attachment !== undefined) Message.setImage(attachment.url)
            Message.setFooter({text: `Author: ${content1.author.id} | MessageID: ${content1.id}`});
            break;

        case c.messageupdate:
            if (!content1.guild) return
            if (content1.author.id === bot.user.id) return;
            if (content1.author.bot) return;
            if (content1.content == content2.content) return;

            if(isOnWhitelist()) return;
            
            gid = content1.guildId

            Message.setColor('#2c4ff9');
            Message.setThumbnail(content1.author.avatarURL({ format: 'jpg' }))
            Message.setAuthor({name: content1.author.username + ' '+content1.author.discriminator, icon_url: content1.author.avatarURL({ format: 'jpg' })})
            Message.setDescription(`**Message edited in <#${content1.channelId}> [Jump to Message](https://discord.com/channels/${content2.guildId}/${content2.channelId}/${content2.id})** \n **Before** \n${content1} \n**After** \n${content2}`);
            Message.setFooter({text: `Author: ${content1.author.id} | MessageID: ${content1.id}`});
            break;
            
        case c.channelcreate:
            gid = content1.guildId

            Message.setColor('#36d30a');
            Message.setDescription(`**Channel ${content1} created**`);
            break;

        case c.channeldelete:
            gid = content1.guildId

            Message.setColor('#a80f2b');
            Message.setDescription(`**Channel #${content1.name} deleted**`);
            break;

        // case c.channelupdate:
        //     gid = content2.guildId
        //     Message.setDescription(`**Channel ${content2} updated** `);
        //     break;

        case c.guildupdate:
            gid = content2.guildId

            Message.setColor('#021982');
            Message.setDescription(`**Guild updated** \n ${content1} ---> ${content2}`);
            break;

        case c.rolecreate:
            gid = content1.guildId

            Message.setColor('#36d30a');
            Message.setDescription(`**Role ${content1} created**`);
            break;

        case c.roleupdate:
            gid = content2.guildId

            Message.setColor('#021982');
            Message.setDescription(`**Role ${content2} updated** \n **Before** \n ${content1} \n **After** \n ${content2}`);
            break;

        case c.roledelete:
            gid = content1.guildId

            Message.setColor('#021982');
            Message.setDescription(`**Role ${content1} deleted**`);
            break;
        
        case c.guildBanAdd:
            let banlist = await isOnBanList({
                user: content1.user, 
                guild: content1.guild,
            });
            setNewModLogMessage(bot, config.defaultModTypes.ban, banlist[2], content1.user, banlist[1], null, content1.guild.id);
            break;
        
        case c.guildBanRemove:
            const fetchedLogs = await content1.guild.fetchAuditLogs({
                limit: 1,
                type: 'MEMBER_BAN_REMOVED',
            });
        
            const banLog = fetchedLogs.entries.first();
            if(banLog) {
                var { executor, target } = banLog;
            }

            setNewModLogMessage(bot, config.defaultModTypes.unban, (target.id === content1.user.id) ? executor.id : null, content1.user, null, null, content1.guild.id);
            break;
        
    }

    if(type === c.debug) {
        return bot.guilds.cache.get(config.DEVELOPER_DISCORD_GUILD_ID).channels.cache.get(config.defaultChannels.DEV_SERVER.debugchannel).send({embeds: [Message]}).catch(err => {});
    }else if(type === c.disconnect) {
        return bot.guilds.cache.get(config.DEVELOPER_DISCORD_GUILD_ID).channels.cache.get(config.defaultChannels.DEV_SERVER.disconnectchannel).send({embeds: [Message]}).catch(err => {});
    }else if(type === c.error){
        return bot.guilds.cache.get(config.DEVELOPER_DISCORD_GUILD_ID).channels.cache.get(config.defaultChannels.DEV_SERVER.errorchannel).send({embeds: [Message]}).catch(err => {});
    }else if(type === c.warn){
        return bot.guilds.cache.get(config.DEVELOPER_DISCORD_GUILD_ID).channels.cache.get(config.defaultChannels.DEV_SERVER.warnchannel).send({embeds: [Message]}).catch(err => {});
    }else if(type === c.reconnecting){
        return bot.guilds.cache.get(config.DEVELOPER_DISCORD_GUILD_ID).channels.cache.get(config.defaultChannels.DEV_SERVER.reconnectingchannel).send({embeds: [Message]}).catch(err => {});
    }

    const cache = await getFromCache({
        cacheName: "logs",
        param_id: gid
    });

    if(cache) {
        if(type === c.messageupdate && cache[0].messagelog !== null) {
            try {
                return bot.channels.cache.get(cache[0].messagelog).send({embeds: [Message]}).catch(err => {});
            }catch(err) {}
        }else {
            if(cache[0].auditlog !== null) {
                try {
                    return bot.channels.cache.get(cache[0].auditlog).send({embeds: [Message]}).catch(err => {});
                }catch(err) {}
            }
        }
    }

    database.query(`SELECT * FROM ${gid}_guild_logs`).then(res => {
        logs = res[0];
        if(type === c.messageupdate && logs.messagelog !== null) {
            return bot.channels.cache.get(logs.messagelog).send({embeds: [Message]}).catch(err => {});
        }else {
            if(logs.auditlog !== null) {
                return bot.channels.cache.get(logs.auditlog).send({embeds: [Message]}).catch(err => {});
            }
        }
    }).catch(err => {
        //NO GUILD LOGS OR NO GUILD ID
    })
    return;
}

module.exports = {auditLog};