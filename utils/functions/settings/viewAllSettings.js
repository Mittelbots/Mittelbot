const config = require('../../../src/assets/json/_config/config.json');
const database = require('../../../src/db/db');
const {
    errorhandler
} = require('../errorhandler/errorhandler');
const {
    getEmote
} = require('../../../utils/functions/getEmote');
const {
    MessageEmbed
} = require('discord.js');

module.exports.viewAllSettings = async ({
    currentsettings,
    guild,
    bot
}) => {
    return new Promise(async (resolve, reject) => {
        let settingMessage = new MessageEmbed()
            .setTitle(`**Settings for ${guild.name}**`)
            .setDescription(`**Change or view Settings**`);

        for (let i in config.settings) {
            const emote = await getEmote(bot, config.settings[i].icon);
            var current;

            if (config.settings[i].colname === config.settings.wc.colname) { //? Wenn Settings gleich Welcome channel

                if (currentsettings[config.settings[i].colname] == null) current = null; //! Wenn es kein Welcome channel gibt

                else current = `<#${currentsettings[config.settings[i].colname]}>`; //! Wenn es ein Welcome channel gibt
            } else if (config.settings[i].colname === config.settings.cooldown.colname) { //? Wenn Settings gleich Cooldown
                if (currentsettings[config.settings[i].colname] == null) current = `Default Cooldown (${config.defaultCooldown.text})`; //! Wenn es kein Cooldown gibt
                else current = currentsettings[config.settings[i].colname] / 1000 + 's'; //! Wenn es ein Cooldown gibt
            } else if (config.settings[i].colname === config.settings.dmcau.colname || config.settings[i].colname === config.settings.dcau.colname) { //? Wenn Settings gleich DeleteCommandAfterUsage
                if (currentsettings[config.settings[i].colname] == '1') current = 'true'; //! Wenn es true ist
                else current = 'false' //! Wenn es false ist
            } else if (config.settings[i].colname === config.settings.joinroles.colname) {
                current = await database.query(`SELECT role_id FROM ${guild.id}_guild_joinroles`).then(res => {
                    if (res.length > 0) {
                        current = '';
                        for (let x in res) {
                            current += `<@&${res[x].role_id}> `;
                        }
                        return current;
                    }
                }).catch(err => {
                    errorhandler({
                        err,
                        fatal: true
                    });
                    return reject(`${config.errormessages.databasequeryerror}`)
                });
            } else if (config.settings[i].colname === config.settings.auditlog.colname || config.settings[i].colname === config.settings.messagelog.colname || config.settings[i].colname === config.settings.modlog.colname) {
                current = await database.query(`SELECT auditlog, messagelog, modlog FROM ${guild.id}_guild_logs`).then(res => {
                    if (res.length > 0) {
                        if (res[0][config.settings[i].colname] == null) return `not set yet`;
                        return `<#${res[0][config.settings[i].colname]}>`;
                    }
                }).catch(err => {
                    errorhandler({
                        err,
                        fatal: true
                    });
                    return reject(`${config.errormessages.databasequeryerror}`)
                });
            } else if (config.settings[i].colname === config.settings.warnroles.colname) {
                current = await database.query(`SELECT * FROM ${guild.id}_guild_warnroles`).then(res => {
                    if (res.length > 0) {
                        current = '';
                        for (let x in res) {
                            current += `<@&${res[x].role_id}> `;
                        }
                        return current;
                    }
                }).catch(err => {
                    errorhandler({
                        err,
                        fatal: true
                    });
                    return reject(`${config.errormessages.databasequeryerror}`)
                })
            } else {
                current = currentsettings[config.settings[i].colname];
            }

            settingMessage.addField(`${emote} - ${config.settings[i].name}`, `${config.settings[i].desc} \n Current Setting: **${current ?? 'Not set yet'}** \n **_Exp: /settings ${config.settings[i].alias} ${config.settings[i].exp}_**`);
        }
        return resolve(settingMessage);
    })
}