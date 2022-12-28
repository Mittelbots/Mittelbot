const { EmbedBuilder } = require('discord.js');
const { errorhandler } = require('../errorhandler/errorhandler');
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
            this.logs
                .send({
                    embeds: [this.embed],
                })
                .then(() => {
                    resolve(true);
                })
                .catch((err) => {
                    errorhandler({
                        err,
                        fatal: true,
                    });
                    resolve(false);
                });
        });
    }

    #getLogs(guild_id, type) {
        return new Promise(async (resolve) => {
            const settings = await Logs.get(guild_id);
            this.logs = settings[type];
            this.logs = this.bot.guilds.cache.get(guild_id).channels.cache.get(this.logs);
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

            if ((this.#ignoreBots && message.author.bot) || !message.guild || message.system)
                return resolve(true);
            if (!this.logs.whitelist) return resolve(false);

            const roles = message.member.roles.cache.map((role) => role.id);
            const channels = message.channel;

            if (this.logs.whitelist.includes(roles) || this.logs.whitelist.includes(channels))
                return resolve(true);
            return resolve(false);
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
                }>**\n**Before**\n${attachment !== undefined ? '' : messageBefore}\n**After**\n${
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
            this.embed.setColor('#021982');
            this.embed.setDescription(
                `**Channel updated: <#${channelBefore.id}>**\n**Before**\n${channelBefore.name}\n**After**\n${channelUpdate.name}`
            );
            resolve(true);
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
            this.embed.setColor('#021982');
            this.embed.setDescription(
                `**Role updated: ${roleBefore.name}** \n**Before**\n${roleBefore.name}\n**After**\n${roleUpdate.name}`
            );
            resolve(true);
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
