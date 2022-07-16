const {
    MessageEmbed
} = require("discord.js");
const database = require("../../../src/db/db");
const {
    errorhandler
} = require("../errorhandler/errorhandler");
const {
    getAllGuildIds
} = require("../data/getAllGuildIds");
const {
    getFromCache,
    addValueToCache,
    xp
} = require('../cache/cache')
const fs = require('fs');
const levelConfig = require('./levelconfig.json');
const levelSystem = require("./levelsystem");
const lvlconfig = require('../../../src/assets/json/levelsystem/levelsystem.json');


var levelCooldown = [];

/**
 * 
 * @param {object} message 
 * @returns {int | boolean} currentXP
 */
module.exports.gainXP = async function ({guild_id, user_id}) {
    var cache = await getFromCache({
        cacheName: 'xp',
        param_id: guild_id,
    });
    if (!cache) return false;
    if (cache[0].xp.length === 0) {
        return await database.query(`SELECT xp, id, level_announce FROM ${guild_id}_guild_level WHERE user_id = ?`, [guild_id]).then(async res => {
            if (res.length > 0) {
                await addValueToCache({
                    cacheName: 'xp',
                    param_id: guild_id,
                    value: {
                        user_id,
                        xp: res[0].xp,
                        id: res[0].id,
                        level_announce: res[0].level_announce
                    },
                    valueName: 'xp'
                })

                return await res[0].xp;
            } else {
                return await database.query(`INSERT INTO ${guild_id}_guild_level (user_id, xp) VALUES (?, ?)`, [guild_id, 10])
                    .then(async res => {
                        await addValueToCache({
                            cacheName: 'xp',
                            param_id: guild_id,
                            value: {
                                user_id,
                                id: res.insertId,
                                xp: 10,
                                level_announce: '0'
                            },
                            valueName: 'xp'
                        })
                    }).catch(err => {
                        errorhandler({
                            err: err,
                            fatal: true
                        })
                        return false;
                    });
                return 10;
            }
        }).catch(err => {
            errorhandler({
                err: err,
                fatal: true
            })
            return false;
        });
    } else {
        const user = await cache[0].xp.find(x => x.user_id === user_id);

        if (!user) {

            try {       
                for(let i in cache[0].xp) {
                    if(cache[0].xp[i].xp.user_id === user_id) {
                        return cache[0].xp[i].xp.xp;
                    }
                }
            }catch(err) {}

            database.query(`INSERT INTO ${guild_id}_guild_level (user_id, xp) VALUES (?, ?)`, [user_id, 10])
                .then(async res => {
                    await addValueToCache({
                        cacheName: 'xp',
                        param_id: guild_id,
                        value: {
                            user_id,
                            id: res.insertId,
                            xp: 10,
                            level_announce: '0',
                            message_count: 0
                        },
                        valueName: 'xp'
                    })
                })
            return false;
        }
        return user.xp;
    }
}

/**
 * 
 * @param {int} currentxp 
 * @returns {int} newxp
 */
module.exports.generateXP = function (currentxp) {
    const randomNumber = Math.floor(Math.random() * 20) + 3; //8 - 27 ca.

    let newxp = Number(currentxp) + Number(randomNumber);

    return newxp;
}

module.exports.updateXP = async function ({guild_id, user_id , newxp}) {
    return await database.query(`UPDATE ${guild_id}_guild_level SET xp = ?, message_count = message_count + 1 WHERE user_id = ?; SELECT message_count FROM ${guild_id}_guild_level WHERE user_id = ?`, [newxp, user_id, user_id])
        .then((res) => {
            for (let i in xp) {
                if (xp[i].id === guild_id) {
                    for (let x in xp[i].xp) {
                        if(xp[i].xp[x].user_id === user_id) {
                            xp[i].xp[x].xp = newxp;
                            xp[i].xp[x].message_count = res[1][0].message_count;
                        }
                    }
                }
            }
            return true;
        })
        .catch(err => {
            errorhandler({
                err: err,
                fatal: true
            })
            return false;
        });
}

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

            nextlevel = setting[Number(i) + 1]

            continue;
        } else if (setting[i].xp > currentxp) {
            continue;
        }
    }

    const level_announce = await this.getLevelAnnounce(guildid, message.author.id);

    if (Number(level_announce) < Number(level)) {
        this.setLevelAnnounce(guildid, message.author.id, level);
        return [level, nextlevel];
    } else {
        return false;
    }

}

module.exports.sendNewLevelMessage = async function (newLevel, message, currentxp, nextlevel) {

    const level_up_channel = await database.query(`SELECT levelup_channel FROM guild_config WHERE guild_id = ?`, message.guild.id)
        .then(res => {
            return res[0].levelup_channel;
        })

    var newLevelMessage = new MessageEmbed()
        .setTitle('🎉 You reached a new Level!')
        .addField(`You reached Level: `, `**${newLevel}**`)
        .addField(`Your current xp are: `, `**${currentxp}**`)
        .addField(`Your next Level:`, `Level: **${nextlevel.level}**, required: **${nextlevel.xp} xp**`)
        .setTimestamp()

    try {
        if(level_up_channel) {
            if(level_up_channel === 'disable') return;
            
            const channel = await message.guild.channels.cache.get(level_up_channel);
            channel.send({
                content: `${message.author}`,
                embeds: [newLevelMessage]
            }).catch(err => {
                return;
            });
        }else {
            message.author.send({
                embeds: [newLevelMessage]
            }).catch(err => {
                return;
            });
        }
    } catch (err) {
        return;
    }
}

/**
 * 
 * ! LEVEL SETTINGS !
 */

module.exports.getAllXP = async () => {
    const all_guild_id = await getAllGuildIds();
    if (all_guild_id) {
        let response = [];
        for (let i in all_guild_id) {
            const obj = {
                guild_id: all_guild_id[i].guild_id,
                xp: await this.getXPOfGuild({
                    guildid: all_guild_id[i].guild_id
                })
            }
            response.push(obj);
        }
        return response;
    } else {
        return false;
    }
}

module.exports.getXPOfGuild = async ({
    guildid
}) => {
    return await database.query(`SELECT * FROM ${guildid}_guild_level`).then(async res => {
        return res;
    }).catch(err => {
        errorhandler({
            err: err,
            fatal: true
        })
        return false;
    })
}

module.exports.getXP = async function (guildid, user_id) {
    return await database.query(`SELECT * FROM ${guildid}_guild_level WHERE user_id = ?`, [user_id])
        .then(res => {
            if (res.length <= 0) {
                return false;
            }
            return res[0];
        })
        .catch(err => {
            errorhandler({
                err: err,
                fatal: true
            })
            return false;
        })
}

/**
 * 
 * @param {int} guildid 
 * @param {array (JSON.stringyfy())} levelorder 
 */
module.exports.setLevelSettingsFromGuild = async function (guildid, levelorder) {
    await database.query(`UPDATE ${guildid}_config SET levelsettings = ?`, [levelorder]).catch(err => {
        errorhandler({
            err: err,
            fatal: true
        })
    })
}

/**
 * 
 * @param {int} guildid 
 * @param {array (JSON.stringyfy())} levelroles 
 */
module.exports.setLevelRolesFromGuild = async function (guildid, levelroles) {
    await database.query(`UPDATE ${guildid}_config SET levelroles = ?`, [levelroles]).catch(err => {
        errorhandler({
            err: err,
            fatal: true
        })
    })
}

/**
 * 
 * @param {int} guildid 
 * @returns {String} Level mode
 */
module.exports.getLevelSettingsFromGuild = async (guildid) => {
    return await database.query(`SELECT levelsettings FROM ${guildid}_config`).then(async res => {
        if (res[0].levelsettings === undefined || res[0].levelsettings === '') {
            res = 'normal'; // NORMAL
        } else {
            res = res[0].levelsettings
        }

        return res;
    }).catch(err => {
        errorhandler({
            err: err,
            fatal: true
        })
        return false;
    })
}

module.exports.getNextLevel = async function (levels, currentlevel) {
    var index = 1;
    
    for(let i in levels) {
        if(levels[i].level === parseInt(currentlevel)) {
            index = levels[i].level + 1
        }
    }

    return levels[index];
}

module.exports.getRankById = async ({user_id, guild_id}) => {
    var cache = await getFromCache({
        cacheName: 'xp',
        param_id: guild_id,
    });

    if(cache) {

        const xp = cache[0].xp;

        var sorted = [];

        for(let i in xp) {
            if(typeof xp[i].xp == 'object') {
                let cachexp = xp[i].xp;
                sorted.push([cachexp.user_id, cachexp.xp, cachexp.level_announce, cachexp.message_count]);
                continue;
            }
            sorted.push([xp[i].user_id, xp[i].xp, xp[i].level_announce, xp[i].message_count])
        }

        sorted = sorted.sort((a, b) => {
            return b[1] - a[1];
        });


        var index;
        for(let i in sorted) {
            if(sorted[i][0] === user_id) {
                index = Number(i) + 1;
            }
        }
        
        return parseInt(index);

    }
}

module.exports.getRankByGuildId = async ({
    guild_id
}) => {
    var cache = await getFromCache({
        cacheName: 'xp',
        param_id: guild_id,
    });

    if(cache) {
        const xp = cache[0].xp;

        var sorted = [];

        for(let i in xp) {
            if(typeof xp[i].xp == 'object') {
                let cachexp = xp[i].xp;
                sorted.push([cachexp.user_id, cachexp.xp, cachexp.level_announce, cachexp.message_count]);
                continue;
            }
            sorted.push([xp[i].user_id, xp[i].xp, xp[i].level_announce, xp[i].message_count])
        }

        sorted = sorted.sort((a, b) => {
            return b[1] - a[1];
        });

        return sorted;
    }
}

module.exports.getLevelAnnounce = async function (guildid, user_id) {
    return await database.query(`SELECT level_announce FROM ${guildid}_guild_level WHERE user_id = ?`, [user_id])
        .then(res => {
            if (res.length <= 0) return false;
            if (res[0].level_announce === null) return false;

            return res[0].level_announce;
        }).catch(err => {
            errorhandler({
                err: err,
                fatal: true
            })
            return false;
        })
}

module.exports.setLevelAnnounce = async function (guildid, user_id, state) {
    return await database.query(`UPDATE ${guildid}_guild_level SET level_announce = ? WHERE user_id = ?`, [state, user_id])
        .then(() => {
            return true
        }).catch(err => {
            errorhandler({
                err: err,
                fatal: true
            })
            return false;
        })
}

module.exports.generateLevelConfig = function ({
    lvl_count = 1,
    mode = '0'
}) {
    return new Promise((resolve, rejects) => {
        var xp = 10;
        var config = {
            easy: (mode == 'easy') ? [] : levelConfig.easy,
            normal: (mode == 'normal') ? [] : levelConfig.normal,
            hard: (mode == 'hard') ? [] : levelConfig.hard
        };

        var lvl_multi;
        switch (mode) {
            case 'easy':
                lvl_multi = 190 // EASY
                break;
            case 'normal':
                lvl_multi = 390 // NORMAL
                break;
            case 'hard':
                lvl_multi = 610; // HARD
                break;
            default:
                lvl_multi = 390; // NORMAL
                break;
        }


        for (let i = 1; i <= lvl_count; i++) {
            const obj = {
                level: i,
                xp: xp + (lvl_multi * i)
            }
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
                default:
                    config.normal.push(obj); // NORMAL
                    break;
            }
        }
        fs.writeFileSync('./utils/functions/levelsystem/levelconfig.json', '', 'utf8');
        fs.writeFileSync('./utils/functions/levelsystem/levelconfig.json', JSON.stringify(config), 'utf8');

        resolve(true);
    })
}

module.exports.levelCooldown = ({
    message,
    bot
}) => {

    const obj = {
        user: message.author.id,
        guild: message.guild.id
    }

    var index = levelCooldown.findIndex((lvlcd) => lvlcd.user === message.author.id && lvlcd.guild === message.guild.id)

    if (index === -1) {
        levelSystem.run(message, bot);

        levelCooldown.push(obj);

        setTimeout(() => {
            newIndex = levelCooldown.findIndex((lvlcd) => lvlcd.user === message.author.id && lvlcd.guild === message.guild.id)
            delete levelCooldown[newIndex]
            levelCooldown = levelCooldown.filter(Boolean)
        }, lvlconfig.timeout);
    }
}

module.exports.changeLevelUp = async ({
    type,
    guild,
    channel
}) => {
    return new Promise((resolve, reject) => {
        if(type === 'dm' || type === 'disable') {
            return database.query(`UPDATE guild_config SET levelup_channel = ? WHERE guild_id = ?`, [(type === 'dm') ? null : 'disable', guild.id])
                .then(() => {
                    return resolve(`✅ Successfully update the levelup type to ${(type === 'dm') ? '**DM**' : '**disabled**'}`)
                })
                .catch(err => {
                    errorhandler({
                        err,
                        fatal: true
                    })
                    return reject(`❌ Something went wrong while updating the config. Please contact the bot support.`)
                })

        }else {

            if(!channel) {
                return reject(`❌ You didn't pass any channel. Please add a channel if you select \`Text Channel\`.`);
            }

            const hasChannelPerms = guild.me.permissionsIn(channel).has(["VIEW_CHANNEL", "SEND_MESSAGES"]);

            if (!hasChannelPerms) {
                return reject(`❌ I don't have one of these permissions \`"VIEW_CHANNEL", "SEND_MESSAGES"\`. Change them and try again.`)
            }

            return database.query(`UPDATE guild_config SET levelup_channel = ? WHERE guild_id = ?`, [channel.id, guild.id])
                .then(() => {
                    return resolve(`✅ Successfully update the levelup type to **Text Channel**. Levelup messages will no be send to ${channel}`)
                })
                .catch(err => {
                    errorhandler({
                        err,
                        fatal: true
                    })
                    return reject(`❌ Something went wrong while updating the config. Please contact the bot support.`)
                })

        }
    })
}