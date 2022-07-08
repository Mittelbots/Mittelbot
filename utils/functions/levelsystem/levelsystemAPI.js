const { MessageEmbed } = require("discord.js");
const database = require("../../../src/db/db");
const { errorhandler } = require("../errorhandler/errorhandler");
const { getAllGuildIds } = require("../data/getAllGuildIds");
const { getFromCache, addValueToCache, updateCache, xp } = require('../cache/cache')
const fs = require('fs');
const levelConfig = require('./levelconfig.json')
/**
 * 
 * @param {object} message 
 * @returns {int | boolean} currentXP
 */
module.exports.gainXP = async function (message, newxp) {
    if(message.author.bot) return;

    const cache = await getFromCache({
        cacheName: 'xp',
        param_id: message.guild.id,
    });
    if(!cache) return false;
    
    if(cache[0].xp.length === 0) {
        return await database.query(`SELECT xp, id, level_announce FROM ${message.guild.id}_guild_level WHERE user_id = ?`, [message.author.id]).then(async res => {
            if(res.length > 0) {       
                await addValueToCache({
                    cacheName: 'xp',
                    param_id: message.guild.id,
                    value: {
                        user_id: message.author.id,
                        xp: res[0].xp,
                        id: res[0].id,
                        level_announce: res[0].level_announce
                    },
                    valueName: 'xp'
                })

                return await res[0].xp;
            }else {
                database.query(`INSERT INTO ${message.guild.id}_guild_level (user_id, xp) VALUES (?, ?)`, [message.author.id, 10])
                    .then(async res => {
                        await addValueToCache({
                            cacheName: 'xp',
                            param_id: message.guild.id,
                            value: {
                                user_id: message.author.id,
                                id: res.insertId,
                                xp: 10,
                                level_announce: '0'
                            },
                            valueName: 'xp'
                        })
                    })
                return true;
            }
        }).catch(err => {
            errorhandler({err: err, fatal: true})
            return false;
        });
    }else {
        const user = cache[0].xp.find(x => x.user_id === message.author.id);
        if(!user) return false;
        return user.xp;
    }
}

/**
 * 
 * @param {int} currentxp 
 * @returns {int} newxp
 */
module.exports.generateXP = function (currentxp) {
    const randomNumber = Math.floor(Math.random() * 20) + 1; //4 - 21 ca.

    let newxp = Number(currentxp) + Number(randomNumber);

    return newxp;
}

module.exports.updateXP = async function (message, newxp) {
    return await database.query(`UPDATE ${message.guild.id}_guild_level SET xp = ? WHERE user_id = ?`, [newxp, message.author.id])
        .then((res) => {
            for(let i in xp) {
                if(xp[i].id === message.guild.id) {
                    for(let x in xp[i].xp) {
                        xp[i].xp[x].xp = newxp;
                    }
                }
            }
            return true;
        })
        .catch(err => {
            errorhandler({err: err, fatal: true})
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

    if(!setting) return false;

    for(let i in setting) {
        if(setting[i].xp <= currentxp) {
            newRoleDB = setting[i];
            level = setting[i].level;

            nextlevel = setting[Number(i) + 1]

            continue;
        }else if(setting[i].xp > currentxp) {
            continue;
        }
    }

    const level_announce = await this.getLevelAnnounce(guildid, message.author.id);

    if(Number(level_announce) < Number(level)) {
        this.setLevelAnnounce(guildid, message.author.id, level);
        return [level, nextlevel];
    }else {
        return false;
    }
    
}

module.exports.sendNewLevelMessage = async function (newLevel, member, currentxp, nextlevel) {
    var newLevelMessage = new MessageEmbed()
        .setTitle('🎉 You reached a new Level!')
        .addField(`You reached Level: `, `**${newLevel}**`)
        .addField(`Your current xp are: `, `**${currentxp}**`)
        .addField(`Your next Level:`, `Level: **${nextlevel.level}**, required: **${nextlevel.xp} xp**`)
        .setTimestamp()

    try {
        member.send({embeds: [newLevelMessage]}).catch(err => {return;});
    }catch(err) {
        return;
    }
}

/**
 * 
 * ! LEVEL SETTINGS !
 */

module.exports.getAllXP = async () => {
    const all_guild_id = await getAllGuildIds();
    if(all_guild_id) {
        let response = [];
        for(let i in all_guild_id) {
            const obj = {
                guild_id: all_guild_id[i].guild_id,
                xp: await this.getXPOfGuild({guildid: all_guild_id[i].guild_id})
            }
            response.push(obj);
        }
        return response;
    }else {
        return false;
    }
}

module.exports.getXPOfGuild = async ({guildid}) => {
    return await database.query(`SELECT * FROM ${guildid}_guild_level`).then(async res => {
        return res;
    }).catch(err => {
        errorhandler({err: err, fatal: true})
        return false;
    })
}

module.exports.getXP = async function (guildid, user_id) {
    return await database.query(`SELECT * FROM ${guildid}_guild_level WHERE user_id = ?`, [user_id])
        .then(res => {
            if(res.length <= 0) {
                return false;
            }
            return res[0];
        })
        .catch(err => {
            errorhandler({err: err, fatal: true})
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
        errorhandler({err: err, fatal: true})
    })
}

/**
 * 
 * @param {int} guildid 
 * @param {array (JSON.stringyfy())} levelroles 
 */
module.exports.setLevelRolesFromGuild = async function (guildid, levelroles) {
    await database.query(`UPDATE ${guildid}_config SET levelroles = ?`, [levelroles]).catch(err => {
        errorhandler({err: err, fatal: true})
    })
}

/**
 * 
 * @param {int} guildid 
 * @returns {String} Level mode
 */
module.exports.getLevelSettingsFromGuild = async function (guildid) {
    return await database.query(`SELECT levelsettings FROM ${guildid}_config`).then(async res => {
        if(res[0].levelsettings === undefined || res[0].levelsettings === '') {
            res = 'normal'; // NORMAL
        }else {
            res = res[0].levelsettings
        }

        return res;
    }).catch(err => {
        errorhandler({err: err, fatal: true})
        return false;
    })
}

module.exports.getNextLevel = async function (levelSettings, currentlevel) {
    const index = levelSettings.findIndex(getIndex)
    function getIndex(level) {
        return level.level === currentlevel
    }
    return levelSettings[index];
}

module.exports.getLevelAnnounce = async function (guildid, user_id) {
    return await database.query(`SELECT level_announce FROM ${guildid}_guild_level WHERE user_id = ?`, [user_id])
        .then(res => {
            if(res.length <= 0) return false;
            if(res[0].level_announce === null) return false;

            return res[0].level_announce;
        }).catch(err => {
            errorhandler({err: err, fatal: true})
            return false;
        })
}

module.exports.setLevelAnnounce = async function (guildid, user_id, state) {
    return await database.query(`UPDATE ${guildid}_guild_level SET level_announce = ? WHERE user_id = ?`, [state, user_id])
        .then(() => {return true}).catch(err => {
            errorhandler({err: err, fatal: true})
            return false;
        })
}

module.exports.generateLevelConfig = function ({
    lvl_count = 1,
    mode = '0'
}) {
    return new Promise((resolve, rejects) => {
        console.log(mode)
        var xp = 10;
        var config = {
            easy: (mode == 'easy') ? [] : levelConfig.easy,
            normal: (mode == 'normal') ? [] : levelConfig.normal,
            hard: (mode == 'hard') ? [] : levelConfig.hard
        };

        //EASY: 20; NORMAL: 50; HARD: 70
        var lvl_multi;
        switch(mode) {
            case 'easy':
                lvl_multi = 100 // EASY
                break;
            case 'normal':
                lvl_multi = 130 // NORMAL
                break;
            case 'hard':
                lvl_multi = 180; // HARD
                break;
            default:
                lvl_multi = 130; // NORMAL
                break;
        }


        for(let i = 1; i <= lvl_count; i++) {
            const obj = {
                level: i,
                xp: xp + (lvl_multi * i)
            }
            switch(mode) {
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