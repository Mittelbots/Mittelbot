const { MessageEmbed } = require("discord.js");
const database = require("../../../src/db/db");



/**
 * 
 * @param {object} message 
 * @returns {int | boolean} currentXP
 */
module.exports.gainXP = async function (message, newxp) {
    if(message.author.bot) return;

    return await database.query(`SELECT xp FROM ${message.guild.id}_guild_level WHERE user_id = ?`, [message.author.id]).then(async res => {
        if(res.length > 0) {
            return await res[0].xp;
        }else {
            database.query(`INSERT INTO ${message.guild.id}_guild_level (user_id, xp) VALUES (?, ?)`, [message.author.id, 10]);
            return true;
        }
    }).catch(err => {
        console.log(err);
        return false;
    });
}

/**
 * 
 * @param {int} currentxp 
 * @returns {int} newxp
 */
module.exports.generateXP = function (currentxp) {
    const randomNumber = Math.floor(Math.random() * 20) + 8; //8 - 27

    let newxp = Number(currentxp) + Number(randomNumber);

    return newxp;
}

module.exports.updateXP = async function (message, newxp) {
    return await database.query(`UPDATE ${message.guild.id}_guild_level SET xp = ? WHERE user_id = ?`, [newxp, message.author.id])
        .then(() => {return true;})
        .catch(err => {
            console.log(err);
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

    if(!levelSettings) return false;

    var possibleNewRankRole;
    var newRoleDB;
    var level;
    for(let i in levelSettings) {
        if(levelSettings[i].needXP <= currentxp) {
            possibleNewRankRole = levelSettings[i].role;
            newRoleDB = levelSettings[i];
            level = levelSettings[i].level;
            continue;
        }else if(levelSettings[i].needXP > currentxp) {
            return;
        }
    }

    if(possibleNewRankRole) {
        const guild = await bot.guilds.cache.get(message.guild.id)
        const user = await guild.members.cache.get(message.author.id);

        var hasRole = await user.roles.cache.some(r => r.id === possibleNewRankRole);

        if(!hasRole) {
            user.roles.add(guild.roles.cache.find(role => role.id === possibleNewRankRole)).catch(err => {})

            const level_announce = await this.getLevelAnnounce(guildid, message.author.id);
            
            if(Number(level_announce) < Number(level)) {
                this.setLevelAnnounce(guildid, message.author.id, level);
                return newRoleDB;
            }else {
                return false;
            }
            
        }
        return false;
    }else return false;
}

module.exports.sendNewLevelMessage = async function (newLevel, member, currentxp) {
    var newLevelMessage = new MessageEmbed()
        .setDescription('You reached a new Level!')
        .addField(`You reached Level: `, `**${newLevel.level}**`)
        .addField(`Your current XP is: `, `**${currentxp}**`)
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

module.exports.getXP = async function (guildid, user_id) {
    return await database.query(`SELECT * FROM ${guildid}_guild_level WHERE user_id = ?`, [user_id])
        .then(res => {
            if(res.length <= 0) {
                return false;
            }
            return res[0];
        })
        .catch(err => {
            console.log(err);
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
        console.log(err);
    })
}

/**
 * 
 * @param {int} guildid 
 * @param {array (JSON.stringyfy())} levelroles 
 */
module.exports.setLevelRolesFromGuild = async function (guildid, levelroles) {
    await database.query(`UPDATE ${guildid}_config SET levelroles = ?`, [levelroles]).catch(err => {
        console.log(err)
    })
}

/**
 * 
 * @param {int} guildid 
 * @returns {array} LevelSettings
 */
module.exports.getLevelSettingsFromGuild = async function (guildid) {
    return await database.query(`SELECT levelsettings FROM ${guildid}_config`).then(async res => {
        if(res[0].levelsettings === undefined || res[0].levelsettings === '') {
            res = false;
        }else {
            res = JSON.parse(res[0].levelsettings);
        }

        return res;
    }).catch(err => {
        console.log(err);
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
            console.log(err);
            return false;
        })
}

module.exports.setLevelAnnounce = async function (guildid, user_id, state) {
    return await database.query(`UPDATE ${guildid}_guild_level SET level_announce = ? WHERE user_id = ?`, [state, user_id])
        .then(() => {return true}).catch(err => {
            console.log(err);
            return false;
        })
}