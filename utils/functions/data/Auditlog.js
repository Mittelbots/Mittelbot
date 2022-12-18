const {
    EmbedBuilder
} = require("discord.js");
const {
    Logs
} = require("./Logs");

class Auditlog {
    bot;
    logs;
    embed;
    constructor(bot, guild_id) {
        return new Promise(async (resolve) => {
            this.bot = bot;
            this.logs = await Logs.get(guild_id);
            this.embed = new EmbedBuilder();
            return resolve(this);
        });
    }

    sendToAuditLog(messageBefore) {
        return new Promise(async (resolve) => {
            if (await this.checkWhitelist(messageBefore)) return resolve(false);
            console.log('1')
            this.embed = await this.generateAuditlogEmbed(messageBefore);
            console.log('2')
            this.send();
            console.log('3')
        });
    }

    send() {
        return new Promise(async (resolve) => {
            if (!this.logs.auditlog) return resolve(false);
            this.bot.channels.cache.get(this.logs.auditlog)
                .send({
                    embed: this.embed
                }).then(() => {
                    resolve(true)
                })
                .catch((err) => {
                    console.log(err);
                    resolve(false);
                });
        });
    }

    generateAuditlogEmbed(message) {
        return new Promise(async (resolve) => {
            this.embed
                .setAuthor({
                    name: message.author.tag,
                    iconURL: message.author.displayAvatarURL()
                })
                .setColor('#fc0509')
                .setThumbnail(
                    message.author.avatarURL({
                        format: 'jpg',
                    })
                )
                .setFooter({
                    text: `Author: ${message.author.id} | MessageID: ${message.id}`,
                });
            resolve(embed)
        });
    }

    checkWhitelist(message) {
        return new Promise(async (resolve) => {
            if (message.author.id === this.bot.user.id || message.author.bot || message.guild || message.system) return resolve(true)
            if (!this.logs.whitelist) return resolve(false);

            const roles = message.member.roles.cache.map((role) => role.id);
            const channels = message.channel;

            if (this.logs.whitelist.includes(roles) || this.logs.whitelist.includes(channels)) return resolve(true);
            return resolve(false);
        });
    }

    messageDelete(message) {
        return new Promise(async (resolve) => {
            const attachment = message.attachments.first();
            this.embed.setDescription(
                `**Message sent by <@${message.author.id}> deleted in <#${
                    message.channelId
                }>** \n${attachment !== undefined ? '' : message}`
            );
            resolve(true)
        });
    }

    channelCreate(channel) {
        return new Promise(async (resolve) => {
            this.embed.setColor('#36d30a');
            this.embed.setDescription(`**Channel created: <#${channel.id}>**`);
            resolve(true)
        });
    }

    channelDelete(channel) {
        return new Promise(async (resolve) => {
            this.embed.setColor('#a80f2b');
            this.embed.setDescription(`**Channel deleted: ${channel.name}**`);
            resolve(true)
        });
    }

    guildUpdate(guildBefore, guildUpdate) {
        return new Promise(async (resolve) => {
            this.embed.setColor('#021982');
            this.embed.setDescription(`**Guild updated** \n ${guildBefore} ---> ${guildUpdate}`);
            resolve(true)
        });
    }

    roleCreate(role) {
        return new Promise(async (resolve) => {
            this.embed.setColor('#36d30a');
            this.embed.setDescription(`**Role created: ${role.name}**`);
            resolve(true)
        });
    }

    roleUpdate(roleBefore, roleUpdate) {
        return new Promise(async (resolve) => {
            this.embed.setColor('#021982');
            this.embed.setDescription(`**Role updated: ${roleBefore.name}** \n ${roleBefore} ---> ${roleUpdate}`);
            resolve(true)
        });
    }

    roleDelete(role) {
        return new Promise(async (resolve) => {
            this.embed.setColor('#a80f2b');
            this.embed.setDescription(`**Role deleted: ${role.name}**`);
            resolve(true)
        });
    }

}

module.exports = Auditlog;