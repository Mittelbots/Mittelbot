const { EmbedBuilder } = require('discord.js');
const Logs = require('~utils/classes/Logs');

class Auditlog {
    bot;
    logs;
    embed;
    #checkWhitelistUser = false;
    #ignoreBots = true;

    constructor() {
        return this;
    }

    init(bot, guild_id = null, checkWhiteList = false) {
        return new Promise(async (resolve) => {
            this.bot = bot;
            this.embed = new EmbedBuilder();
            this.#checkWhitelistUser = checkWhiteList;
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

    sendToAuditLog({ guildId, target = null, type = 'auditlog' }) {
        return new Promise(async (resolve) => {
            await this.#getLogs(guildId, type);
            if (await this.#checkWhitelist(target)) return resolve(false);
            this.embed = await this.#generateAuditlogEmbed(target);
            this.send();
        });
    }

    send() {
        return new Promise(async (resolve) => {
            if (!this.logs) return resolve(false);
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
            const settings = await new Logs().get(guild_id);
            try {
                this.logs = this.bot.guilds.cache.get(guild_id).channels.cache.get(settings[type]);
            } catch (e) {
                resolve(false);
            }
            resolve(true);
        });
    }

    #generateAuditlogEmbed(target) {
        return new Promise(async (resolve) => {
            if (target.author) {
                this.embed
                    .setAuthor({
                        name: target.author.tag,
                        iconURL: target.author.displayAvatarURL(),
                    })
                    .setThumbnail(
                        target.author.avatarURL({
                            format: 'jpg',
                        })
                    )
                    .setFooter({
                        text: `Author: ${target.author.id} | MessageID: ${target.id}`,
                    });
            } else {
                if (target.user) target = target.guild;

                this.embed
                    .setAuthor({
                        name: target.name,
                        iconURL: target.iconURL(),
                    })
                    .setFooter({
                        text: `Author: Server`,
                    });
            }
            resolve(this.embed);
        });
    }

    #checkWhitelist(message = null) {
        return new Promise(async (resolve) => {
            if (!this.#checkWhitelistUser || !message) return resolve(false);
            try {
                if ((this.#ignoreBots && message.author.bot) || message.author.system)
                    return resolve(true);
            } catch (e) {
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
            const isEnabled = await new Logs().isEventEnabled({ guild_id, event: eventName });
            resolve(isEnabled);
        });
    }

    setEmbed({ color = '#021982', text, imageUrl = null, fields = [] }) {
        return new Promise(async (resolve) => {
            this.embed.setColor(color);
            this.embed.setDescription(text);

            if (fields.length > 0) {
                this.embed.addFields(
                    fields.map((field) => {
                        return {
                            name: field.name,
                            value: field.value,
                            inline: field.inline || false,
                        };
                    })
                );
            }

            if (imageUrl) {
                const isObject = typeof imageUrl === 'object';
                const isUrl = imageUrl.url;
                const isVideo = imageUrl.url?.includes('mp4');

                if (isObject && isUrl && isVideo) this.embed.setDescription(imageUrl.url);

                if (isObject && isUrl && !isVideo) this.embed.setImage(imageUrl.url);
                if (!isObject) this.embed.setImage(imageUrl);
            }
            resolve(true);
        });
    }

    /* 
        ===============================================
        =============  GUILD EVENTS  ==================
        ===============================================
    */

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
                description += `**<#${
                    channelUpdate.id
                }> rateLimitPerUser changed**\n\n**Before**\n${
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
                description = `**<#${
                    channelUpdate.id
                }> type changed**\n\n**Before**\n${getRealTypeName(
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
}

module.exports = Auditlog;
