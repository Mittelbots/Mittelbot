const { EmbedBuilder } = require('discord.js');
const { errorhandler } = require('../errorhandler/errorhandler');
const fs = require('fs');
const levelConfig = require('../../../src/assets/json/levelsystem/levelconfig.json');
const lvlconfig = require('../../../src/assets/json/levelsystem/levelsystem.json');
const { GuildConfig } = require('./Config');
const guildLevel = require('../../../src/db/Models/tables/guildLevel.model');

var levelCooldownArray = [];

class Levelsystem {
    constructor() {}

    gain({ guild_id, user_id }) {
        return new Promise(async (resolve) => {
            const userXP = await this.get({
                guild_id,
                user_id,
            });
        
            if (userXP) {
                return resolve(userXP.xp);
            } else {
                await this.add({
                    guild_id,
                    user_id,
                });
                return resolve(10);
            }
        });
    }

    generateNewXp(currentxp) {
        const randomNumber = Math.floor(Math.random() * 20) + 3; //8 - 27 ca.
        return Number(currentxp) + Number(randomNumber);    
    }

    updateMessageCount({user_id, guild_id}) {
        return new Promise(async (resolve) => {
            const userXp = await this.get({user_id, guild_id});
            if(userXp.length == 0) {
                return await this.add({user_id, guild_id});
            }

            const newMessageCount = Number(userXp.message_count) + 1;

            await this.update({
                guild_id,
                user_id,
                value: newMessageCount,
                valueName: 'message_count',
            });
            resolve(true);
        })
    }

    update({ guild_id, user_id, value, valueName }) {
        return new Promise(async (resolve) => {
            await guildLevel.update({
                [valueName]: value,
            }, {
                where: {
                    guild_id,
                    user_id,
                },
            }).then((result) => {
                return resolve(result);
            }).catch((err) => {
                return resolve(false);
            });
        });
    }

    check(guildid, currentxp, message) {
        return new Promise(async (resolve) => {
            const levelSettings = await this.getSetting(guildid);

            var level;
            var nextlevel;
        
            const setting = levelConfig[levelSettings];
        
            if (!setting) return resolve(false);
        
            for (let i in setting) {
                if (setting[i].xp <= currentxp) {
                    newRoleDB = setting[i];
                    level = setting[i].level;
        
                    nextlevel = setting[Number(i) + 1];
        
                    continue;
                } else if (setting[i].xp > currentxp) {
                    continue;
                }
            }
        
            const level_announce = await this.getLevelAnnounce(guildid, message.author.id);
        
            if (level_announce && Number(level_announce) < Number(level)) {
                this.update({
                    guild_id: guildid,
                    user_id: message.author.id,
                    val: level,
                    valueName: 'level_announce',
                });
                return resolve([level, nextlevel]);
            } else {
                return resolve(false);
            }
        });
    }

    getGuild({ guild_id }) {
        return new Promise(async (resolve) => {
            await guildLevel.findAll({
                where: {
                    guild_id,
                },
            }).then((result) => {
                return resolve(result);
            }).catch((err) => {
                return resolve(false);
            });
        });
    }
    
    get({ guild_id, user_id }) {
        return new Promise(async (resolve) => {
            await guildLevel.findOne({
                where: {
                    guild_id,
                    user_id,
                },
            }).then((result) => {
                return resolve(result);
            }).catch((err) => {
                return resolve(false);
            });
        });
    }

    add({ guild_id, user_id }) {
        return new Promise(async (resolve) => {
            await guildLevel.create({
                guild_id,
                user_id,
            }).then((result) => {
                return resolve(result);
            }).catch((err) => {
                console.log(err);
                return resolve(false);
            });
        });
    }
    getSetting(guild_id) {
        return new Promise(async (resolve) => {
            const guildConfig = await GuildConfig.get(guild_id);

            return resolve(JSON.parse(guildConfig.levelsettings));
        });
    }

    getNextLevel(levels, currentlevel) {
        return new Promise(async (resolve) => {
            for (let i in levels) {
                if (levels[i].level == currentlevel) {
                    return resolve(levels[Number(i) + 1]);
                }
            }
        });
    }

    getRank({ user_id, guild_id }) {
        return new Promise(async (resolve) => {
            const guild = await this.getGuild({
                guild_id,
            });
            if(!guild) return resolve([]);
            const sorted = guild.sort((a, b) => b.xp - a.xp);
        
            for (let i in sorted) {
                if (sorted[i].user_id == user_id) {
                    return resolve(Number(i) + 1);
                }
            }
        });
    }

    getLevelAnnounce(guild_id, user_id) {
        return new Promise(async (resolve) => {
            const user = await this.get({
                guild_id,
                user_id,
            });
        
            if (user) {
                return resolve(user.level_announce);
            } else {
                return resolve(false);
            }
        });
    }

    generate({ lvl_count = 1, mode = '0' }) {
        return new Promise((resolve, rejects) => {
            var xp = 10;
            var config = {
                easy: mode == 'easy' ? [] : levelConfig.easy,
                normal: mode == 'normal' ? [] : levelConfig.normal,
                hard: mode == 'hard' ? [] : levelConfig.hard,
            };
    
            var lvl_multi;
            switch (mode) {
                case 'easy':
                    lvl_multi = 190; // EASY
                    break;
                case 'normal':
                    lvl_multi = 390; // NORMAL
                    break;
                case 'hard':
                    lvl_multi = 610; // HARD
                    break;
                default: // NORMAL
                    lvl_multi = 390;
                    break;
            }
    
            let multiplier = 0.005;
            let top_multiplier = 1;
    
            let prev;
    
            for (let i = 0; i <= lvl_count; i++) {
                const obj = {
                    level: i,
                    xp: Math.round(
                        xp + lvl_multi * top_multiplier.toFixed(3) * (multiplier.toFixed(3) * 100)
                    ),
                };
                switch (mode) {
                    case 'easy':
                        config.easy.push(obj); // EASY
                        break;
                    case 'normal':
                        config.normal.push(obj); // NORMAL
                        break;
                    case 'hard':
                        config.hard.push(obj); // HARD
                        break;
                    default: // NORMAL
                        config.normal.push(obj);
                        break;
                }
                multiplier += 0.005;
    
                if (i < 20) {
                    top_multiplier += 1;
                } else {
                    if (mode == 'easy') {
                        top_multiplier += 0.8;
                    }
                    if (mode == 'normal') {
                        top_multiplier += 0.5;
                    }
                    if (mode == 'hard') {
                        top_multiplier += 0.3;
                    }
                }
    
                errorhandler({
                    err: [
                        obj.level,
                        obj.xp,
                        'multi ' + multiplier.toFixed(3),
                        'top_multi ' + top_multiplier.toFixed(3),
                        'diff ' + (obj.xp - prev).toFixed(0),
                    ],
                    fatal: false,
                    message: 'Generating level config',
                });
                prev = obj.xp;
            }
            fs.writeFileSync('./utils/functions/levelsystem/levelconfig.json', '', 'utf8');
            fs.writeFileSync(
                './utils/functions/levelsystem/levelconfig.json',
                JSON.stringify(config),
                'utf8'
            );
    
            return resolve(true);
        });

    }

    cooldown({ message, bot }) {
        return new Promise(async (resolve) => {
            const obj = {
                user: message.author.id,
                guild: message.guild.id,
            };
        
            const index = levelCooldownArray.findIndex(
                (lvlcd) => lvlcd.user === message.author.id && lvlcd.guild === message.guild.id
            );
        
            if (index === -1) {
                const { error } = await this.runLevelSystem(message);
        
                if (error == 'blacklist') return resolve(false);
        
                levelCooldownArray.push(obj);
        
                setTimeout(() => {
                    levelCooldownArray = levelCooldownArray.filter(
                        (u) => u.user !== message.author.id && u.guild !== message.guild.id
                    );
                }, lvlconfig.timeout);
            }
        });
    }

    runLevelSystem(message) {
        return new Promise(async (resolve) => {
            if (message.author.bot || message.author.system) {
                return {
                    error: 'bot',
                };
            }
        
            
            const isBlacklistChannel = await this.checkBlacklist({
                message,
            });
        
            if (isBlacklistChannel)
                return {
                    error: 'blacklist',
                };
        
            const currentxp = await this.gain({
                guild_id: message.guild.id,
                user_id: message.author.id,
            });
        
            if (!currentxp)
                return {
                    error: 'noxp',
                };
        
            const newxp = this.generateNewXp(currentxp);
        
            const updateXP = await this.update({
                guild_id: message.guild.id,
                user_id: message.author.id,
                value: newxp,
                valueName: 'xp',
            });
            if (!updateXP) {
                return {
                    error: 'updatexp',
                };
            }

            await this.updateMessageCount({user_id: message.author.id, guild_id: message.guild.id});
                
            const checkXP = await this.check(message.guild.id, newxp, message);
            if (!checkXP)
                return {
                    error: 'checkxp',
                };
        
            await this.sendNewLevelMessage(checkXP[0], message, newxp, checkXP[1]);
        
            currentxp, newxp, updateXP, (checkXP = null);
        
            return {
                error: 'none',
            };
        });
    }

    run({ message, bot }) {
        return new Promise(async (resolve) => {
            await this.cooldown({ message, bot });
        });
    }

    changeLevelUp({ type, guild, channel }) {
        return new Promise(async (resolve, reject) => {
            const guildConfig = await GuildConfig.get(guild.id);
            const levelsettings = guildConfig.levelsettings;
    
            if (type === 'dm' || type === 'disable') {
                levelsettings.levelup_channel = type === 'dm' ? 'dm' : 'disable';
            } else {
                if (!channel) {
                    return reject(
                        `❌ You didn't pass any channel. Please add a channel if you select \`Text Channel\`.`
                    );
                }
    
                await guild.members.fetch();
                const hasChannelPerms = guild.members.me
                    .permissionsIn(channel)
                    .has(['VIEW_CHANNEL', 'SEND_MESSAGES']);
    
                if (!hasChannelPerms) {
                    return reject(
                        `❌ I don't have one of these permissions \`"VIEW_CHANNEL", "SEND_MESSAGES"\`. Change them and try again.`
                    );
                }
    
                levelsettings.levelup_channel = channel.id;
            }
    
            await GuildConfig.update({
                guild_id: guild.id,
                value: levelsettings,
                valueName: 'levelsettings',
            })
                .then(() => {
                    return resolve(
                        `✅ Successfully update the levelup ${
                            type === 'dm'
                                ? 'type to **DM**'
                                : type === 'disable'
                                ? 'type to **disabled**'
                                : 'channel to ' + channel
                        }`
                    );
                })
                .catch(() => {
                    return reject(
                        `❌ Something went wrong while updating the config. Please contact the bot support.`
                    );
                });
        });
    }

    checkBlacklist({ message }) {
        return new Promise(async (resolve) => {
            let blacklistchannels;

            const guildConfig = await GuildConfig.get(message.guild.id);
            const levelsettings = JSON.parse(guildConfig.levelsettings);
            if (levelsettings.length > 0) {
                blacklistchannels = levelsettings.blacklistchannels;
            }
        
            if (!blacklistchannels) return resolve(false);
        
            return blacklistchannels.includes(message.channel.id) ||
                blacklistchannels.includes(message.channel.parentId)
                ? resolve(true)
                : resolve(false);
        });
    }
}

module.exports.Levelsystem = new Levelsystem();

module.exports.sendNewLevelMessage = async function (newLevel, message, currentxp, nextlevel) {
    const guildConfig = await GuildConfig.get(message.guild.id);

    const levelsettings = guildConfig.levelsettings;

    const newLevelMessage = new EmbedBuilder()
        .setTitle('🎉 You reached a new Level!')
        .addFields([
            {
                name: `You reached Level: `,
                value: `**${newLevel}**`,
            },
            {
                name: `Your XP: `,
                value: `**${currentxp}**`,
            },
            {
                name: `Next Level: `,
                value: `**${nextlevel.level}**, required: **${nextlevel.xp} xp**`,
            },
        ])
        .setTimestamp();

    try {
        if (levelsettings.level_up_channel !== 'dm') {
            if (level_up_channel === 'disable') return;

            const channel = await message.guild.channels.cache.get(levelsettings.level_up_channel);
            channel
                .send({
                    content: `${message.author}`,
                    embeds: [newLevelMessage],
                })
                .catch((err) => {
                    return;
                });
        } else {
            message.author
                .send({
                    embeds: [newLevelMessage],
                })
                .catch((err) => {
                    return;
                });
        }
    } catch (err) {
        return;
    }
};
