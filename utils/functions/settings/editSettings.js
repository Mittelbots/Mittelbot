const { MessageEmbed } = require('discord.js');
const config = require('../../../src/assets/json/_config/config.json');
const database = require('../../../src/db/db');
const { errorhandler } = require('../errorhandler/errorhandler');
const { getModTime } = require('../getModTime');


module.exports.editSettings = async ({setting, value, message, }) => {
    
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
                    return errorhandler({
                        err,
                        fatal: true
                    });
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
                    if (!role) {
                        return await database.query(`DELETE FROM ${message.guild.id}_guild_joinroles`)
                            .then(() => {
                                message.reply(`Joinroles successfully cleared.`).catch(err => {});
                            })
                            .catch(err => {
                                return errorhandler({
                                    err,
                                    fatal: true
                                });
                            });
                    } else {
                        return await database.query(`INSERT INTO ${message.guild.id}_guild_joinroles (role_id) VALUES (?)`, [role]).catch(err => {
                            return errorhandler({
                                err,
                                fatal: true
                            });
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
                        return errorhandler({
                            err,
                            fatal: true
                        });
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
                    return errorhandler({
                        err,
                        fatal: true
                    });
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
                            return errorhandler({
                                err,
                                fatal: true
                            });
                        });
                }

                var roles = value.replaceAll('<', '').replaceAll('@', '').replaceAll('&', '').replaceAll('!', '').replaceAll('>', '');
                roles = roles.split(' ');

                database.query(`DELETE FROM ${message.guild.id}_guild_warnroles`).catch(err => {
                    return errorhandler({
                        err,
                        fatal: true
                    });
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
                        return errorhandler({
                            err,
                            fatal: true
                        });
                    });
                }
                return message.reply(`Warn roles successfully saved!`).catch(err => {});
            }
            continue;
        }

        function saveSetting() {
            database.query(`UPDATE ${message.guild.id}_config SET ${setting} = ?`, [value]).catch(err => {
                return errorhandler({err, fatal: true});
            });
        }
    }
}