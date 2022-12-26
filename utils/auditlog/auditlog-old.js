const { EmbedBuilder } = require('discord.js');
const config = require('../../src/assets/json/_config/config.json');
const ignorechannel = require('../../src/assets/json/ignorechannel/ignorechannel.json');
const { isOnBanList } = require('../functions/moderations/checkOpenInfractions');
const { setNewModLogMessage } = require('../modlog/modlog');
const { Logs } = require('../functions/data/Logs');

var c = config.auditTypes;
var gid = '';

function auditLog(bot) {

}

async function sendToAudit(bot, type, content1, content2) {
    if (ignorechannel.c.indexOf(content1.channelId) !== -1) return;

    var Message = new EmbedBuilder().setTimestamp();

    async function isOnWhitelist() {
        const logs = await Logs.get(content1.guild.id);
        var whitelist = logs.whitelist;

        if (whitelist && whitelist.length > 0) {
            var userRoles = content1.member.roles.cache.map((role) => role.id);
            var channel = content1.channel;

            var isWhitelist = whitelist.filter(function (item) {
                return userRoles.indexOf(item) > -1 || channel.id.indexOf(item) > -1;
            });

            if (isWhitelist.length > 0) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }

    switch (type) {
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
            if (!content1.guild) return;
            if (content1.author.bot) return;

            gid = content1.guildId;
            Message.setColor('#fc0509');
            Message.setThumbnail(
                content1.author.avatarURL({
                    format: 'jpg',
                })
            );
            Message.setAuthor({
                name: content1.author.username + ' ' + content1.author.discriminator,
                icon_url: content1.author.avatarURL({
                    format: 'jpg',
                }),
            });
            Message.setDescription(
                `**Bulkmessages sent by <@${content1.author.id}> deleted in <#${content1.channelId}>** \n${content1}`
            );
            Message.setFooter({
                text: `Author: ${content1.author.id} | MessageID: ${content1.id}`,
            });
            break;

        case c.messagedelete:
            if (!content1.guild) return;
            if (content1.author.id === bot.user.id) return;
            if (content1.author.bot) return;
            if (content1.system) return;
            if (await isOnWhitelist()) return;

            gid = content1.guildId;

            const attachment = content1.attachments.first();

            Message.setColor('#fc0509');
            Message.setThumbnail(
                content1.author.avatarURL({
                    format: 'jpg',
                })
            );
            Message.setAuthor({
                name: content1.author.username + ' ' + content1.author.discriminator,
                icon_url: content1.author.avatarURL({
                    format: 'jpg',
                }),
            });
            Message.setDescription(
                `**Message sent by <@${content1.author.id}> deleted in <#${
                    content1.channelId
                }>** \n${attachment !== undefined ? '' : content1}`
            );
            if (content1.stickers.size > 1) {
                Message.addFields([
                    {
                        name: 'Stickers',
                        value: content1.stickers.map((s) => s.url).join('\n'),
                    },
                ]);
            }
            if (attachment !== undefined) Message.setImage(attachment.url);
            Message.setFooter({
                text: `Author: ${content1.author.id} | MessageID: ${content1.id}`,
            });
            break;

        case c.messageupdate:
            if (!content1.guild) return;
            if (content1.author.id === bot.user.id) return;
            if (content1.author.bot) return;
            if (content1.content == content2.content) return;

            if (await isOnWhitelist()) return;

            gid = content1.guildId;

            Message.setColor('#2c4ff9');
            Message.setThumbnail(
                content1.author.avatarURL({
                    format: 'jpg',
                })
            );
            Message.setAuthor({
                name: content1.author.username + ' ' + content1.author.discriminator,
                icon_url: content1.author.avatarURL({
                    format: 'jpg',
                }),
            });
            Message.setDescription(
                `**Message edited in <#${content1.channelId}> [Jump to Message](https://discord.com/channels/${content2.guildId}/${content2.channelId}/${content2.id})** \n **Before** \n${content1} \n**After** \n${content2}`
            );
            Message.setFooter({
                text: `Author: ${content1.author.id} | MessageID: ${content1.id}`,
            });
            break;

        case c.channelcreate:
            gid = content1.guildId;

            Message.setColor('#36d30a');
            Message.setDescription(`**Channel ${content1} created**`);
            break;

        case c.channeldelete:
            gid = content1.guildId;

            Message.setColor('#a80f2b');
            Message.setDescription(`**Channel #${content1.name} deleted**`);
            break;

        // case c.channelupdate:
        //     gid = content2.guildId
        //     Message.setDescription(`**Channel ${content2} updated** `);
        //     break;

        case c.guildupdate:
            gid = content2.guildId;

            Message.setColor('#021982');
            Message.setDescription(`**Guild updated** \n ${content1} ---> ${content2}`);
            break;

        case c.rolecreate:
            gid = content1.guildId;

            Message.setColor('#36d30a');
            Message.setDescription(`**Role ${content1} created**`);
            break;

        case c.roleupdate:
            gid = content2.guildId;

            Message.setColor('#021982');
            Message.setDescription(
                `**Role ${content2} updated** \n **Before** \n ${content1} \n **After** \n ${content2}`
            );
            break;

        case c.roledelete:
            gid = content1.guildId;

            Message.setColor('#021982');
            Message.setDescription(`**Role ${content1} deleted**`);
            break;

        case c.guildBanAdd:
            let banlist = await isOnBanList({
                user: content1.user,
                guild: content1.guild,
            });
            setNewModLogMessage(
                bot,
                config.defaultModTypes.ban,
                banlist[2].id,
                content1.user,
                banlist[1],
                null,
                content1.guild.id
            );
            break;

        case c.guildBanRemove:
            const fetchedLogs = await content1.guild.fetchAuditLogs({
                limit: 1,
                type: 'MEMBER_BAN_REMOVED',
            });

            const banLog = fetchedLogs.entries.first();
            if (banLog) {
                var { executor, target } = banLog;
            }

            setNewModLogMessage(
                bot,
                config.defaultModTypes.unban,
                target.id === content1.user.id ? executor.id : null,
                content1.user,
                null,
                null,
                content1.guild.id
            );
            break;
    }

    if (type === c.debug) {
        return bot.guilds.cache
            .get(process.env.DEVELOPER_DISCORD_GUILD_ID)
            .channels.cache.get(process.env.DC_DEBUG)
            .send({
                embeds: [Message],
            })
            .catch((err) => {});
    } else if (type === c.disconnect) {
        return bot.guilds.cache
            .get(process.env.DEVELOPER_DISCORD_GUILD_ID)
            .channels.cache.get(process.env.DC_DISCONNECT)
            .send({
                embeds: [Message],
            })
            .catch((err) => {});
    } else if (type === c.error) {
        return bot.guilds.cache
            .get(process.env.DEVELOPER_DISCORD_GUILD_ID)
            .channels.cache.get(process.env.DC_ERROR)
            .send({
                embeds: [Message],
            })
            .catch((err) => {});
    } else if (type === c.warn) {
        return bot.guilds.cache
            .get(process.env.DEVELOPER_DISCORD_GUILD_ID)
            .channels.cache.get(process.env.DC_WARN)
            .send({
                embeds: [Message],
            })
            .catch((err) => {});
    } else if (type === c.reconnecting) {
        return bot.guilds.cache
            .get(process.env.DEVELOPER_DISCORD_GUILD_ID)
            .channels.cache.get(process.env.DC_RECONNECT)
            .send({
                embeds: [Message],
            })
            .catch((err) => {});
    }

    const logs = await Logs.get(content1.guild.id);

    if (type === c.messageupdate && logs.messagelog !== null) {
        try {
            return bot.channels.cache
                .get(logs.messagelog)
                .send({
                    embeds: [Message],
                })
                .catch((err) => {});
        } catch (err) {}
    } else {
        if (logs.auditlog !== null) {
            try {
                return bot.channels.cache
                    .get(logs.auditlog)
                    .send({
                        embeds: [Message],
                    })
                    .catch((err) => {});
            } catch (err) {}
        }
    }
}

module.exports = {
    auditLog,
};
