const guildAutoBlacklist = require('~src/db/Models/guildAutoBlacklist.model');
const { getModTime } = require('~utils/functions/getModTime');
const { isMod } = require('~utils/functions//isMod');
const { banUser } = require('~utils/functions//moderations/banUser');
const { isBanned } = require('~utils/functions//moderations/checkOpenInfractions');

module.exports = class AutoBlacklist {
    constructor() {}

    set({ guild_id, channel, message }) {
        return new Promise((resolve, reject) => {
            guildAutoBlacklist
                .create({
                    guild_id,
                    channel,
                    message,
                })
                .then(() => {
                    resolve(true);
                })
                .catch((err) => {
                    reject(false);
                });
        });
    }

    get(guild_id) {
        return new Promise((resolve, reject) => {
            guildAutoBlacklist
                .findOne({
                    where: {
                        guild_id,
                    },
                })
                .then((settings) => {
                    resolve(settings);
                })
                .catch((err) => {
                    reject(false);
                });
        });
    }

    delete(guild_id) {
        return new Promise((resolve, reject) => {
            guildAutoBlacklist
                .destroy({
                    where: {
                        guild_id,
                    },
                })
                .then(() => {
                    resolve(true);
                })
                .catch((err) => {
                    reject(false);
                });
        });
    }

    check(message, bot) {
        return new Promise(async (resolve) => {
            if (!message.webhookId) return resolve(false);
            await this.get(message.guild.id).then(async (settings) => {
                if (!settings) return resolve(false);

                const channel = settings.channel;
                if (!channel || channel !== message.channel.id) return resolve(false);

                message.content = message.content.replace(/\n/g, ' ');
                const messageArray = message.content.split(' ');
                let users = [];

                for (let i in messageArray) {
                    if (isNaN(messageArray[i])) continue;
                    let user_id;
                    try {
                        user_id = messageArray[i].match(/\d/g);
                    } catch (e) {}
                    try {
                        users.push(user_id.join(''));
                    } catch (err) {}
                }

                let isUserBannedArray = [];

                for (let i in users) {
                    if (isUserBannedArray.includes(users[i])) continue;

                    const guild = await bot.guilds.cache.get(message.guild.id);
                    let member = await guild.members.cache.find((member) => member.id === users[i]);

                    if (!member) member = users[i];
                    if (await isMod({ member, guild: message.guild })) return;

                    const isUserBanned = await isBanned(member, message.guild);
                    if (isUserBanned.isBanned) return;

                    await banUser({
                        user: member ? member : users[i],
                        mod: bot.user,
                        guild: message.guild,
                        reason: settings.message ? settings.message : 'Banned by Blacklist.',
                        bot,
                        dbtime: getModTime('99999d'),
                        time: 'Permanent',
                        isAuto: true,
                    })
                        .then(() => {
                            message.channel.send(`${users[i]} has been banned.`).catch((err) => {
                                message.react('✅').catch((err) => {});
                            });
                        })
                        .catch(() => {
                            message.react('❌').catch((err) => {});
                        });
                    isUserBannedArray.push(member ? member : users[i]);
                }
                resolve(true);
            });
        });
    }
};
