const { EmbedBuilder } = require('discord.js');
const { Logs } = require('./Logs');

class Auditlog {
    bot;
    logs;
    embed;
    #checkWhitelistUser = false;
    #ignoreBots = true;

    constructor() {
        return this;
    }

    init(bot, guild_id = null) {
        return new Promise(async (resolve) => {
            this.bot = bot;
            this.embed = new EmbedBuilder();
            if (!Number(guild_id)) {
                switch (guild_id) {
                    case 'reco':
                        this.logs = process.env.DC_RECONNECT;
                        break;
                    case 'err':
                        this.logs = process.env.DC_ERROR;
                        break;
                    case 'warn':
                        this.logs = process.env.DC_WARN;
                        break;
                    case 'disc':
                        this.logs = process.env.DC_DISCONNECT;
                        break;
                    default:
                        this.logs = process.env.DC_DEBUG;
                        break;
                }

                this.logs = this.bot.guilds.cache
                    .get(process.env.DEVELOPER_DISCORD_GUILD_ID)
                    .channels.cache.get(this.logs);
            }
            return resolve(this);
        });
    }

    sendToAuditLog(contentBefore, type = 'auditlog') {
        return new Promise(async (resolve) => {
            await this.#getLogs(contentBefore.guild.id, type);
            if (await this.#checkWhitelist(contentBefore)) return resolve(false);
            this.embed = await this.#generateAuditlogEmbed(contentBefore);
            this.send();
        });
    }

    send() {
        return new Promise(async (resolve) => {
            if(!this.logs) return resolve(false);
            this.logs
                .send({
                    embeds: [this.embed],
                })
                .then(() => {
                    resolve(true);
                })
                .catch((err) => {
                    resolve(false);
                });
        });
    }

    #getLogs(guild_id, type) {
        return new Promise(async (resolve) => {
            const settings = await Logs.get(guild_id);
            try {
                this.logs = this.bot.guilds.cache.get(guild_id).channels.cache.get(settings[type]);
            }catch(e) {
                resolve(false);
            }
            resolve(true);
        });
    }

    #generateAuditlogEmbed(message) {
        return new Promise(async (resolve) => {
            if (message.author) {
                this.embed
                    .setAuthor({
                        name: message.author.tag,
                        iconURL: message.author.displayAvatarURL(),
                    })
                    .setThumbnail(
                        message.author.avatarURL({
                            format: 'jpg',
                        })
                    )
                    .setFooter({
                        text: `Author: ${message.author.id} | MessageID: ${message.id}`,
                    });
            } else {
                this.embed
                    .setAuthor({
                        name: message.guild.name,
                        iconURL: message.guild.iconURL(),
                    })
                    .setFooter({
                        text: `Author: Server`,
                    });
            }
            resolve(this.embed);
        });
    }

    #checkWhitelist(message) {
        return new Promise(async (resolve) => {
            if (!this.#checkWhitelistUser) return resolve(false);

            try {
                if(this.#ignoreBots && message.author.bot || message.author.system) return resolve(true);
            }catch(e) {
                // ignore err because it's probably a channel change
            }

            if (!message.guild || message.system) {
                return resolve(true);
            }

            if (!this.logs || !this.logs.whitelist) {
                return resolve(false);
            }
            
            const roles = message.member.roles.cache.map((role) => role.id);
            const channels = message.channel;

            if (this.logs.whitelist.includes(roles) || this.logs.whitelist.includes(channels))
                return resolve(true);
            return resolve(false);
        });
    }

    checkEnabledEvents(guild_id, eventName) {
        return new Promise(async (resolve) => {
            const isEnabled = await Logs.isEventEnabled({guild_id, event: eventName});
            resolve(isEnabled);
        });
    }

    /* 
        ===============================================
        =============  GUILD EVENTS  ==================
        ===============================================
    */

    messageDelete(message) {
        return new Promise(async (resolve) => {
            this.#checkWhitelistUser = true;
            const attachment = message.attachments.first();
            this.embed.setDescription(
                `**Message sent by <@${message.author.id}> deleted in <#${message.channelId}>** \n${
                    attachment !== undefined ? '' : message
                }`
            );
            if (attachment !== undefined) {
                this.embed.setImage(attachment.url);
            }
            resolve(true);
        });
    }

    messageDeleteBulk(messages) {
        return new Promise(async (resolve) => {
            this.#checkWhitelistUser = true;
            this.embed.setDescription(
                `**${messages.size} messages deleted in <#${messages.first().channelId}>**`
            );
            resolve(true);
        });
    }

    messageUpdate(messageBefore, messageUpdate) {
        return new Promise(async (resolve) => {
            this.#checkWhitelistUser = true;
            const attachment = messageUpdate.attachments.first();
            this.embed.setDescription(
                `**Message sent by <@${messageUpdate.author.id}> edited in <#${
                    messageUpdate.channelId
                }>\n[Jump to Message](https://discord.com/channels/${messageUpdate.guildId}/${messageUpdate.channelId}/${messageUpdate.id})**\n\n**Before**\n${attachment !== undefined ? '' : messageBefore}\n\n**After**\n${
                    attachment !== undefined ? '' : messageUpdate
                }`
            );
            resolve(true);
        });
    }

    channelCreate(channel) {
        return new Promise(async (resolve) => {
            this.embed.setColor('#36d30a');
            this.embed.setDescription(`**Channel created: <#${channel.id}>**`);
            resolve(true);
        });
    }

    channelDelete(channel) {
        return new Promise(async (resolve) => {
            this.embed.setColor('#a80f2b');
            this.embed.setDescription(`**Channel deleted: ${channel.name}**`);
            resolve(true);
        });
    }

    channelUpdate(channelBefore, channelUpdate) {
        return new Promise(async (resolve) => {
            let changedOptions = [];
            let changedBefore = [];
            for (let option in channelBefore) {
                if (channelBefore[option] !== channelUpdate[option]) {
                    changedBefore.push(channelBefore[option]);
                    changedOptions.push(option);
                }
            }
            let description = '';

            if (changedOptions.includes('name')) {
                description += `**Channel name changed**\n\n**Before**\n${
                    changedBefore[changedOptions.indexOf('name')]
                }\n**After**\n${channelUpdate.name}\n\n`;
            }
            if (changedOptions.includes('nsfw')) {
                description += `**<#${channelUpdate.id}> nsfw changed**\n\n**Before**\n${
                    changedBefore[changedOptions.indexOf('nsfw')]
                }\n**After**\n${channelUpdate.nsfw}\n\n`;
            }
            if (changedOptions.includes('parentId')) {
                description += `**<#${channelUpdate.id}> parent changed**\n\n**Before**\n<#${
                    changedBefore[changedOptions.indexOf('parentId')]
                }>\n**After**\n${channelUpdate.parent}\n\n`;
            }
            if (changedOptions.includes('rateLimitPerUser')) {
                description += `**<#${channelUpdate.id}> rateLimitPerUser changed**\n\n**Before**\n${
                    changedBefore[changedOptions.indexOf('rateLimitPerUser')]
                }s\n**After**\n${channelUpdate.rateLimitPerUser || 0}s\n\n`;
            }
            if (changedOptions.includes('topic')) {
                description += `**<#${channelUpdate.id}> topic changed**\n\n**Before**\n${
                    changedBefore[changedOptions.indexOf('topic')] || 'None'
                }\n**After**\n${channelUpdate.topic}\n\n`;
            }
            if (changedOptions.includes('type')) {
                const getRealTypeName = (type) => {
                    switch (type) {
                        case 0:
                            return 'Text';
                        case 2:
                            return 'Voice';
                        case 4:
                            return 'Category';
                        case 5:
                            return 'Announcement Channel';
                        case 6:
                            return 'Store';
                        default:
                            return 'Unknown';
                    }
                };
                description = `**<#${channelUpdate.id}> type changed**\n\n**Before**\n${getRealTypeName(
                    changedBefore[changedOptions.indexOf('type')]
                )}\n**After**\n${getRealTypeName(channelUpdate.type)}\n\n`;
            }
            if (changedOptions.includes('userLimit')) {
                description += `**<#${channelUpdate.id}> userLimit changed**\n\n**Before**\n${
                    changedBefore[changedOptions.indexOf('userLimit')] || 'None'
                }\n**After**\n${channelUpdate.userLimit}\n\n`;
            }
            if (changedOptions.includes('bitrate')) {
                description += `**<#${channelUpdate.id}> bitrate changed**\n\n**Before**\n${
                    changedBefore[changedOptions.indexOf('bitrate')]
                }\n**After**\n${channelUpdate.bitrate}\n\n`;
            }
            //TODO add permission overwrites

            try {
                this.embed.setColor('#021982');
                this.embed.setDescription(description);
                resolve(true);
            } catch (e) {
                resolve(false);
            }
        });
    }

    debug(info) {
        return new Promise(async (resolve) => {
            this.embed.setColor('#021982');
            this.embed.setDescription(`**Debug info** \n ${info}`);
            resolve(true);
        });
    }

    disconnect(event) {
        return new Promise(async (resolve) => {
            this.embed.setColor('#a80f2b');
            this.embed.setDescription(`**WebSocket Disconnected** \n ${event}`);
            resolve(true);
        });
    }

    reconnecting() {
        return new Promise(async (resolve) => {
            this.embed.setColor('#021982');
            this.embed.setDescription(`**WebSocket Reconnecting**`);
            resolve(true);
        });
    }

    error(error) {
        return new Promise(async (resolve) => {
            this.embed.setColor('#a80f2b');
            this.embed.setDescription(`**Error** \n ${error}`);
            resolve(true);
        });
    }

    warn(warning) {
        return new Promise(async (resolve) => {
            this.embed.setColor('#a80f2b');
            this.embed.setDescription(`**Warning** \n ${warning}`);
            resolve(true);
        });
    }

    guildUpdate(guildBefore, guildUpdate) {
        return new Promise(async (resolve) => {
            this.embed.setColor('#021982');
            this.embed.setDescription(
                `**Guild updated**\n**Before**\n${guildBefore}\n**After**\n${guildUpdate}`
            );
            resolve(true);
        });
    }

    roleCreate(role) {
        return new Promise(async (resolve) => {
            this.embed.setColor('#36d30a');
            this.embed.setDescription(`**Role created: ${role.name}**`);
            resolve(true);
        });
    }

    roleUpdate(roleBefore, roleUpdate) {
        return new Promise(async (resolve) => {
            let changedOptions = [];
            let changedBefore = [];
            for (let option in roleBefore) {
                if (roleBefore[option] !== roleUpdate[option]) {
                    changedBefore.push(roleBefore[option]);
                    changedOptions.push(option);
                }
            }

            let description = '';

            if (changedOptions.includes('name')) {
                description += `**Role name changed**\n**Before**\n${
                    changedBefore[changedOptions.indexOf('name')]
                }\n**After**\n${roleUpdate.name}\n\n`;
            }
            if (changedOptions.includes('color')) {
                description += `**Role color changed**\n**Before**\n${
                    changedBefore[changedOptions.indexOf('color')]
                }\n**After**\n${roleUpdate.color}\n\n`;
            }
            if (changedOptions.includes('hoist')) {
                description += `**Role hoist changed**\n**Before**\n${
                    changedBefore[changedOptions.indexOf('hoist')]
                }\n**After**\n${roleUpdate.hoist}\n\n`;
            }
            if (changedOptions.includes('mentionable')) {
                description += `**Role mentionable changed**\n**Before**\n${
                    changedBefore[changedOptions.indexOf('mentionable')]
                }\n**After**\n${roleUpdate.mentionable}\n\n`;
            }
            //TODO add permissions

            try {
                this.embed.setColor('#021982');
                this.embed.setDescription(description);
                resolve(true);
            } catch (e) {
                resolve(false);
            }
        });
    }

    roleDelete(role) {
        return new Promise(async (resolve) => {
            this.embed.setColor('#a80f2b');
            this.embed.setDescription(`**Role deleted: ${role.name}**`);
            resolve(true);
        });
    }
}

module.exports = Auditlog;