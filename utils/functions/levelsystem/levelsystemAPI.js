const { EmbedBuilder } = require('discord.js');
const database = require('../../../src/db/db');
const { errorhandler } = require('../errorhandler/errorhandler');
const fs = require('fs');
const levelConfig = require('./levelconfig.json');
const levelSystem = require('./levelsystem');
const lvlconfig = require('../../../src/assets/json/levelsystem/levelsystem.json');
const { getGuildConfig, updateGuildConfig } = require('../data/getConfig');

var levelCooldownArray = [];

/**
 *
 * @param {object} guild_id
 * @param {object} user_id
 * @returns {int | boolean} currentXP
 */
module.exports.gainXP = async ({ guild_id, user_id }) => {
    const userXP = await this.getXpOfUser({
        guild_id,
        user_id,
    });

    if (userXP) {
        return userXP.xp;
    } else {
        await this.addUserToGuildLevel({
            guild_id,
            user_id,
        });
        return 10;
    }
};

/**
 *
 * @param {int} currentxp
 * @returns {int} newxp
 */
module.exports.generateXP = function (currentxp) {
    const randomNumber = Math.floor(Math.random() * 20) + 3; //8 - 27 ca.

    let newxp = Number(currentxp) + Number(randomNumber);

    return newxp;
};

module.exports.updateGuildLevel = async function ({ guild_id, user_id, value, valueName }) {
    for (let i in guildLevel) {
        if (guildLevel[i].id === guild_id) {
            guildLevel[i].levels[valueName] = value;
        }
    }

    return await database
        .query(`UPDATE guild_level SET ${valueName} = ? WHERE user_id = ? AND guild_id = ?`, [
            value,
            user_id,
            guild_id,
        ])
        .then(() => {
            return guildLevel;
        })
        .catch((err) => {
            errorhandler({
                err,
                fatal: true,
            });
            return false;
        });
};

/**
 *
 * @param {int} guildid
 * @param {int} currentxp
 */
module.exports.checkXP = async function (bot, guildid, currentxp, message) {
    const levelSettings = await this.getLevelSettingsFromGuild(guildid);

    var level;
    var nextlevel;

    let setting = levelConfig[levelSettings];

    if (!setting) return false;

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
        this.updateGuildLevel({
            guild_id: guildid,
            user_id: message.author.id,
            val: level,
            valueName: 'level_announce',
        });
        return [level, nextlevel];
    } else {
        return false;
    }
};

module.exports.sendNewLevelMessage = async function (newLevel, message, currentxp, nextlevel) {
    const { settings } = getGuildConfig({
        guild_id: message.guild.id,
    });

    var levelsettings;
    try {
        levelsettings = JSON.parse(settings.levelsettings) || {};
    } catch (e) {
        levelsettings = settings.levelsettings;
    }

    var newLevelMessage = new EmbedBuilder()
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

/**
 *
 * ! LEVEL SETTINGS !
 */

module.exports.getXPOfGuild = async ({ guildid }) => {
    const cache = await getFromCache({
        cacheName: 'guildLevel',
        param_id: guildid,
    });
    if (cache.length > 0) {
        return cache[0].levels;
    }

    return await database
        .query(`SELECT * FROM guild_level WHERE guild_id = ?`, [guildid])
        .then(async (res) => {
            return res;
        })
        .catch((err) => {
            errorhandler({
                err: err,
                fatal: true,
            });
            return false;
        });
};

module.exports.getXpOfUser = async ({ guild_id, user_id }) => {
    const guildxp = await this.getXPOfGuild({
        guildid: guild_id,
    });
    return guildxp.filter((u) => u.user_id === user_id)[0] || false;
};

module.exports.addUserToGuildLevel = async ({ guild_id, user_id }) => {
    return await database
        .query(`INSERT INTO guild_level (guild_id, user_id) VALUES (?, ?)`, [guild_id, user_id])
        .then(async (res) => {
            await addValueToCache({
                cacheName: 'guildLevel',
                param_id: guild_id,
                value: {
                    user_id,
                    id: res.insertId,
                    xp: 10,
                    level_announce: '0',
                },
                valueName: 'levels',
            });
            return true;
        })
        .catch((err) => {
            errorhandler({
                err: err,
                fatal: true,
            });
            return false;
        });
};

/**
 *
 * @param {int} guildid
 * @returns {String} Level mode
 */
module.exports.getLevelSettingsFromGuild = async (guild_id) => {
    const { settings } = await getGuildConfig({
        guild_id,
    });

    return settings.levelsettings;
};

module.exports.getNextLevel = async function (levels, currentlevel) {
    var index = 1;

    for (let i in levels) {
        if (levels[i].level === parseInt(currentlevel)) {
            index = levels[i].level + 1;
        }
    }

    return levels[index];
};

module.exports.getRank = async ({ user_id, guild_id }) => {
    const guildXp = await this.getXPOfGuild({
        guildid: guild_id,
    });

    var sorted = [];

    for (let i in guildXp) {
        sorted.push([
            guildXp[i].user_id,
            guildXp[i].xp,
            guildXp[i].level_announce,
            guildXp[i].message_count,
        ]);
    }

    sorted = sorted.sort((a, b) => {
        return b[1] - a[1];
    });

    if (user_id) {
        var index;
        for (let i in sorted) {
            if (sorted[i][0] === user_id) {
                index = Number(i) + 1;
            }
        }
        return parseInt(index);
    } else {
        return sorted;
    }
};

module.exports.getLevelAnnounce = async function (guildid, user_id) {
    const userXP = await this.getXpOfUser({
        guild_id: guildid,
        user_id,
    });

    return userXP.level_announce || false;
};

module.exports.generateLevelConfig = function ({ lvl_count = 1, mode = '0' }) {
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

        resolve(true);
    });
};

module.exports.levelCooldown = async ({ message, bot }) => {
    const obj = {
        user: message.author.id,
        guild: message.guild.id,
    };

    var index = levelCooldownArray.findIndex(
        (lvlcd) => lvlcd.user === message.author.id && lvlcd.guild === message.guild.id
    );

    if (index === -1) {
        const { error } = await levelSystem.run(message, bot);

        if (error == 'blacklist') return;

        levelCooldownArray.push(obj);

        setTimeout(() => {
            levelCooldownArray = levelCooldownArray.filter(
                (u) => u.user !== message.author.id && u.guild !== message.guild.id
            );
        }, lvlconfig.timeout);
    }
};

module.exports.changeLevelUp = async ({ type, guild, channel }) => {
    return new Promise(async (resolve, reject) => {
        const { settings } = await getGuildConfig({
            guild_id: guild.id,
        });

        var levelsettings;
        try {
            levelsettings = JSON.parse(settings.levelsettings) || {};
        } catch (e) {
            levelsettings = settings.levelsettings;
        }

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

        return updateGuildConfig({
            guild_id: guild.id,
            value: JSON.stringify(levelsettings),
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
};

module.exports.checkBlacklistChannels = async ({ message }) => {
    const cache = await getFromCache({
        cacheName: 'guildConfig',
        param_id: message.guild.id,
    });

    var blacklistchannels;

    if (cache.length > 0) {
        try {
            blacklistchannels = JSON.parse(cache[0].settings.levelsettings).blacklistchannels;
        } catch (err) {
            blacklistchannels = [];
        }
    } else {
        const { settings } = await getGuildConfig({
            guild: message.guild.id,
        });

        let levelsettings;
        try {
            levelsettings = JSON.parse(settings.levelsettings);
        } catch (err) {
            levelsettings = {};
        }

        if (levelsettings && levelsettings.length > 0) {
            blacklistchannels = levelsettings.levelsettings.blacklistchannels;
        }
    }
    if (blacklistchannels) {
        if (
            blacklistchannels.includes(message.channel.id) ||
            blacklistchannels.includes(message.channel.parentId)
        ) {
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
};
