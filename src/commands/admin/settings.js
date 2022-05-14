const config = require('../../../src/assets/json/_config/config.json');
const cmd_help = require('../../../src/assets/json/command_config/command_help.json');
const {
    MessageEmbed,
    Permissions
} = require('discord.js');
const {
    getModTime
} = require('../../../utils/functions/getModTime');
const {
    getEmote
} = require('../../../utils/functions/getEmote');
const {
    viewSetting
} = require('../../../utils/functions/viewSetting');
const {
    log
} = require('../../../logs');
const database = require('../../db/db');
const {
    errorhandler
} = require('../../../utils/functions/errorhandler/errorhandler');

module.exports.run = async (bot, message, args) => {
    if (config.deleteModCommandsAfterUsage == 'true') {
        message.delete().catch(err => {});
    }
    if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        message.delete().catch(err => {});
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete().catch(err => {}), 5000);
        }).catch(err => {});
    }

    let setting = args.slice(0).join(" ");
    let value = args.slice(1).join(" ");

    /**
     * VIEW SETTINGS
     */
    if (value == '') {
        var currentsettings = database.query(`SELECT * FROM ${message.guild.id}_config LIMIT 1`).then(async res => {
            return await res[0];
        }).catch(err => {
            errorhandler({err, fatal: true});
            return message.channel.send(`${config.errormessages.databasequeryerror}`).catch(err => {});
        });

        currentsettings = await currentsettings;

        var passed = false;
        for (let i in config.settings) {
            if (setting == config.settings[i].alias) {
                passed = true;
                /**
                 * TO-DO:
                 * - Hinzufügen von settings die eigene SQL Abfrage brauchen
                 */
                return viewSetting(bot, message, config.settings[i].name, config.settings[i].desc, config.settings[i].icon, currentsettings[config.settings[i].colname], `**_Exp: ${currentsettings.prefix}settings ${config.settings[i].alias} ${config.settings[i].exp}_**`)
            }
        }
        if (!passed) viewAllSettings();

        async function viewAllSettings() {
            let settingMessage = new MessageEmbed()
                .setTitle(`**Settings for ${message.guild.name}**`)
                .setDescription(`**Change or view Settings**`);

            for (let i in config.settings) {
                let emote = await getEmote(bot, config.settings[i].icon);
                var current;
                if (config.settings[i].colname === config.settings.wc.colname)
                    if (currentsettings[config.settings[i].colname] == null) current = null;
                    else current = `<#${currentsettings[config.settings[i].colname]}>`;
                else if (config.settings[i].colname === config.settings.cooldown.colname && currentsettings[config.settings[i].colname] === null) current = `Default Cooldown (${config.defaultCooldown.text})`;
                else if (config.settings[i].colname === config.settings.dmcau.colname || config.settings[i].colname === config.settings.dcau.colname) {
                    if (currentsettings[config.settings[i].colname] == '1') current = 'true';
                    else current = 'false'
                } else if (config.settings[i].colname === config.settings.joinroles.colname) {
                    database.query(`SELECT * FROM ${message.guild.id}_guild_joinroles`).then(res => {
                        if (res.length > 0) {
                            current = '';
                            for (let x in res) {
                                current += `<@${res[x].role_id}> `;
                            }
                        }
                    }).catch(err => {
                        log.fatal(err);
                        if (config.debug == 'true') console.log(err);
                        return message.channel.send(`${config.errormessages.databasequeryerror}`).catch(err => {});
                    });
                } else if (config.settings[i].colname === config.settings.auditlog.colname || config.settings[i].colname === config.settings.messagelog.colname || config.settings[i].colname === config.settings.modlog.colname) {
                    current = database.query(`SELECT auditlog, messagelog, modlog FROM ${message.guild.id}_guild_logs`).then(res => {
                        if (res.length > 0) {
                            if (res[0][config.settings[i].colname] == null) return `not set yet`;
                            return `<#${res[0][config.settings[i].colname]}>`;
                        }
                    }).catch(err => {
                        log.fatal(err);
                        if (config.debug == 'true') console.log(err);
                        return message.channel.send(`${config.errormessages.databasequeryerror}`).catch(err => {});
                    });
                } else if (config.settings[i].colname === config.settings.warnroles.colname) {
                    current = database.query(`SELECT * FROM ${message.guild.id}_guild_warnroles`).then(res => {
                        if (res.length > 0) {
                            current = '';
                            for (let x in res) {
                                current += `<@&${res[x].role_id}> `;
                            }
                            return current;
                        }
                    }).catch(err => {
                        log.fatal(err);
                        if (config.debug == 'true') console.log(err);
                        return message.channel.send(`${config.errormessages.databasequeryerror}`).catch(err => {});
                    })
                } else {
                    current = currentsettings[config.settings[i].colname];
                }

                settingMessage.addField(`${emote} - ${config.settings[i].name}`, `${config.settings[i].desc} \n Current Setting: **${await current ?? 'Not set yet'}** \n **_Exp: ${currentsettings.prefix}settings ${config.settings[i].alias} ${config.settings[i].exp}_**`);
            }
            return message.channel.send({
                embeds: [settingMessage]
            }).catch(err => {
                return errorhandler({err, fatal: false});
            });
        }

    } else {
        /**
         *? EDIT SETTING
         */
        setting = setting.replace(value, '').replace(' ', '');
        for (let i in config.settings) {
            if (config.settings[i].alias === setting) {

                //? CHECK THE VALUE INPUT
                if (typeof value == config.settings[i].val == false && config.settings[i].val !== 'boolean' && config.settings[i].val !== 'mention' && config.settings[i].val !== 'time') {
                    return message.reply(`Value has to be ${config.settings[i].val}`).catch(err => {});
                } else if (config.settings[i].val === 'boolean') {
                    if (value !== 'true' && value !== 'false') return message.reply(`Value has to be true or false`).catch(err => {});
                } else if (config.settings[i].val === 'time') {
                    if (!value.endsWith('s') && !value.endsWith('m') && !value.endsWith('h') && !value.endsWith('d')) return message.reply(`Value has to be time (e.g. 1m or 30s)`).catch(err => {});
                }

                //? IF SETTING IS PREFIX
                if (setting == config.settings.prefix.alias) {
                    let pass = 0;
                    for (let i in config.settings.prefix.required) {
                        if (!value.endsWith(config.settings.prefix.required[i])) pass++;
                    }
                    if (pass === (config.settings.prefix.required).length) return message.reply(`Invalid prefix`).catch(err => {});

                    message.reply(`Prefix succesfully changed to **${value}**`).catch(err => {});
                    return saveSetting();
                }
                //? IF SETTING IS WELCOME_CHANNEL
                else if (setting == config.settings.wc.alias) {

                    if (value.toLowerCase() === 'none') {
                        value = null;
                        setting = config.settings.wc.colname;
                        message.reply(`Welcome channel succesfully removed.`).catch(err => {});
                        return saveSetting();
                    }

                    //check if channel exists
                    let channel = value.replace('<', '').replace('#', '').replace('>', '')
                    try {
                        message.guild.channels.cache.get(`${channel}`).send(`Just to test my permissions!`).then(msg => msg.delete()).catch(err => {});
                    } catch (err) {
                        return message.reply(`Either i don't have permissions to see/write into this channel or this channel doesn't exists`).catch(err => {});
                    }
                    message.reply(`${config.settings.wc.name} successfully changed to ${value}`).catch(err => {});
                    setting = config.settings.wc.colname
                    value = channel;
                    return saveSetting();
                }
                //? IF SETTING IS COOLDOWN
                else if (setting == config.settings.cooldown.alias) {
                    let dbtime = getModTime(value);
                    if (dbtime <= 0 || dbtime == false) {
                        value = null;
                        message.reply(`Command Cooldown successfully turned off \n \n**Info: A default Cooldown of 2 Seconds is still enabled to protect the bot from spam!**`).catch(err => {});
                    } else {
                        message.reply(`Command Cooldown successfully changed to ${value} \n \n**Info: Cooldown can be interupted when the bot is offline!**`).catch(err => {});
                        value = dbtime * 1000;
                    }
                    setting = config.settings.cooldown.colname;
                    return saveSetting();
                }
                //? IF SETTING IS DELETE MOD COMMAND AFTER USAGE
                else if (setting == config.settings.dmcau.alias) {
                    setting = config.settings.dmcau.colname;
                    if (value.toLowerCase() == 'false') {
                        value = 0;
                        message.reply(`Mod Commands will **don't** get deleted after usage!`).catch(err => {});
                    } else {
                        value = 1;
                        message.reply(`Mod Commands **will** get deleted after usage!`).catch(err => {});
                    }
                    return saveSetting();
                }
                //? IF SETTING IS DELETE COMMAND AFTER USAGE
                else if (setting == config.settings.dcau.alias) {
                    setting = config.settings.dcau.colname;
                    if (value.toLowerCase() == 'false') {
                        value = 0;
                        message.reply(`Commands will **don't** get deleted after usage!`).catch(err => {});
                    } else {
                        value = 1;
                        message.reply(`Commands **will** get deleted after usage!`).catch(err => {});
                    }
                    return saveSetting();
                }
                //? UF SETTING IS JOINROLES
                else if (setting == config.settings.joinroles.alias) {

                    if (value.toLowerCase() === 'none') return saveJoinRoles(false);


                    var roles = value.replaceAll('<', '').replaceAll('@', '').replaceAll('&', '').replaceAll('!', '').replaceAll('>', '');
                    roles = roles.split(' ');

                    var removedRoles = '';
                    let checkroles = database.query(`SELECT * FROM ${message.guild.id}_guild_joinroles`).then(res => {
                        if (res.length > 0) { //? ROLES AREADY EXISTS
                            for (let i in res) {
                                for (let x in roles) {
                                    if (res[i].role_id === roles[x]) {
                                        database.query(`DELETE FROM ${message.guild.id}_guild_joinroles WHERE role_id = ?`, [roles[x]]).catch(err => {
                                            console.log(err);
                                            message.channel.send(`${config.errormessages.databasequeryerror}`)
                                        });
                                        removedRoles += `<@&${roles[x]}> `;
                                        roles[x] = '';
                                    }
                                }
                            }
                        }
                        if (removedRoles !== '') {
                            message.reply(`${removedRoles} got removed from joinroles.`).then(msg => returnMessage = null).catch(err => {});
                        }
                        return true;
                    }).catch(err => {
                        return errorhandler({err, fatal: true});
                    })
                    if (await checkroles && roles[0] !== '') {
                        var passedRoles = [];
                        for (let i in roles) {
                            try {
                                var role = message.guild.roles.cache.get(roles[i]);
                            } catch (err) {
                                return message.reply(`${roles[i]} doesn't exists! All existing mentions before are saved.`).catch(err => {});
                            }
                            try {
                                if (!message.member.roles.cache.find(r => r.id.toString() === role.id.toString())) {
                                    await message.member.roles.add(role).catch(err => {});
                                    await message.member.roles.remove(role).catch(err => {});
                                } else {
                                    await message.member.roles.remove(role).catch(err => {});
                                    await message.member.roles.add(role).catch(err => {});
                                }
                            } catch (err) {
                                return message.reply(`I don't have the permission to add this role: **${role.name}**`).catch(err => {});
                            }
                            passedRoles.push(role.id);
                        }
                        for (let i in passedRoles) {
                            saveJoinRoles(passedRoles[i]);
                        }
                        return message.reply(`Roles saved to Joinroles.`).catch(err => {});
                    } else {
                        return;
                    }

                    async function saveJoinRoles(role) {
                        if(!role) {
                            return await database.query(`DELETE FROM ${message.guild.id}_guild_joinroles`)
                            .then(() => {
                                message.reply(`Joinroles successfully cleared.`).catch(err => {});
                            })
                            .catch(err => {
                                return errorhandler({err, fatal: true});
                            });
                        }else {
                            return await database.query(`INSERT INTO ${message.guild.id}_guild_joinroles (role_id) VALUES (?)`, [role]).catch(err => {
                                return errorhandler({err, fatal: true});
                            })
                        }
                    }

                }
                //? IF SETTING IS AUDIT-LOG
                //? IF SETTING IS MESSAGE-LOG
                //? IF SETTING IS MOD-LOG
                else if (setting == config.settings.auditlog.alias || setting == config.settings.messagelog.alias || setting == config.settings.modlog.alias) {

                    if (value.toLowerCase() !== 'none') {

                        var channel = value.replace('<', '').replace('#', '').replace('>', '');
                        channel = message.guild.channels.cache.get(channel)
                        let embed = new MessageEmbed()
                            .setTitle('Test')
                            .addField('To test', 'my permissions')

                        let pass = true;
                        await channel.send({
                            embeds: [embed]
                        }).then(msg => msg.delete()).catch(err => {
                            pass = false;
                            return errorhandler({err, fatal: true});
                        });

                        if (!pass) return;

                    }

                    var dbcol;

                    switch (true) {
                        case setting == config.settings.auditlog.alias:
                            dbcol = config.settings.auditlog.colname;
                            break;
                        case setting == config.settings.modlog.alias:
                            dbcol = config.settings.modlog.colname;
                            break;
                        case setting == config.settings.messagelog.alias:
                            dbcol = config.settings.messagelog.colname;
                            break;
                    }


                    database.query(`UPDATE ${message.guild.id}_guild_logs SET ${dbcol} = ? WHERE id = 1`, [(channel) ? channel.id : null]).then(() => {
                        if (value.toLowerCase() === 'none') {
                            return message.reply(`Log successfully removed.`).catch(err => {});
                        } else {
                            return message.reply(`${channel} successfully saved!`).catch(err => {});
                        }
                    }).catch(err => {
                        return errorhandler({err, fatal: true});
                    });
                }
                //? IF SETTING IS WARNROLES
                else if (setting == config.settings.warnroles.alias) {

                    if (value.toLowerCase() === 'none') {
                        return await database.query(`DELETE FROM ${message.guild.id}_guild_warnroles`)
                            .then(() => {
                                return message.reply(`Removed all warnroles.`).catch(err => {});
                            })
                            .catch(err => {
                                return errorhandler({err, fatal: true});
                            });
                    }

                    var roles = value.replaceAll('<', '').replaceAll('@', '').replaceAll('&', '').replaceAll('!', '').replaceAll('>', '');
                    roles = roles.split(' ');

                    database.query(`DELETE FROM ${message.guild.id}_guild_warnroles`).catch(err => {
                        return errorhandler({err, fatal: true});
                    });

                    for (let i in roles) {
                        try {
                            var role = message.guild.roles.cache.get(roles[i]);
                        } catch (err) {
                            return message.reply(`${roles[i]} doesn't exists!`).catch(err => {});
                        }
                        try {
                            if (!message.member.roles.cache.find(r => r.id.toString() === role.id.toString())) {
                                await message.member.roles.add(role).catch(err => {});
                                await message.member.roles.remove(role).catch(err => {});
                            } else {
                                await message.member.roles.remove(role).catch(err => {});
                                await message.member.roles.add(role).catch(err => {});
                            }
                        } catch (err) {
                            return message.reply(`I don't have the permission to add this role: **${role.name}**`).catch(err => {});
                        }
                    }
                    for (let i in roles) {
                        database.query(`INSERT INTO ${message.guild.id}_guild_warnroles (${config.settings.warnroles.colname}) VALUES (?)`, [roles[i]]).catch(err => {
                            return errorhandler({err, fatal: true});
                        });
                    }
                    return message.reply(`Warn roles successfully saved!`).catch(err => {});
                }
                continue;
            }
        }

        function saveSetting() {
            database.query(`UPDATE ${message.guild.id}_config SET ${setting} = ?`, [value]).catch(err => {
                return errorhandler({err, fatal: true});
            });
        }
    }


}

module.exports.help = cmd_help.admin.settings;