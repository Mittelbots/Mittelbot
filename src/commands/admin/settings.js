const config = require('../../../config.json');
const {
    MessageEmbed,
    Permissions
} = require('discord.js');
const {
    Database
} = require('../../db/db');
const {
    getModTime
} = require('../../../utils/functions/getModTime');
const { getEmote } = require('../../../utils/functions/getEmote');
const { viewSetting } = require('../../../utils/functions/viewSetting');

module.exports.run = async (bot, message, args) => {
    if (config.deleteModCommandsAfterUsage == 'true') {
        message.delete();
    }
    if (!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
        message.delete();
        return message.channel.send(`<@${message.author.id}> ${config.errormessages.nopermission}`).then(msg => {
            setTimeout(() => msg.delete(), 5000);
        });
    }

    let setting = args.slice(0).join(" ");
    let value = args.slice(1).join(" ");

    /**
     * VIEW SETTINGS
     */
    if (value == '') {
        const database = new Database();
        var currentsettings = database.query(`SELECT * FROM ${message.guild.id}_config LIMIT 1`).then(async res => {
            return await res[0];
        }).catch(err => {
            console.log(err);
            return message.channel.send(`${config.errormessages.databasequeryerror}`);
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
                if(config.settings[i].colname === config.settings.wc.colname) if(currentsettings[config.settings[i].colname] == null) current = null; else current = `<#${currentsettings[config.settings[i].colname]}>`;
                else if(config.settings[i].colname === config.settings.cooldown.colname && currentsettings[config.settings[i].colname] === null) current = `Default Cooldown (${config.defaultCooldown.text})`;
                else if(config.settings[i].colname === config.settings.dmcau.colname || config.settings[i].colname === config.settings.dcau.colname){ if(currentsettings[config.settings[i].colname] == '1') current = 'true'; else current = 'false'}
                else if(config.settings[i].colname === config.settings.joinroles.colname) { 
                    database.query(`SELECT * FROM ${message.guild.id}_guild_joinroles`).then(res => {
                        if(res.length > 0) {
                            current = ''; 
                            for(let x in res) {
                                current += `<@${res[x].role_id}> `;
                            }
                        }
                    }).catch(err => {
                        console.log(err);
                        return message.channel.send(`${config.errormessages.databasequeryerror}`);
                    });
                }
                else if(config.settings[i].colname === config.settings.auditlog.colname || config.settings[i].colname === config.settings.messagelog.colname ||config.settings[i].colname === config.settings.modlog.colname) { 
                    current = database.query(`SELECT auditlog, messagelog, modlog FROM ${message.guild.id}_guild_logs`).then(res => {
                        if(res.length > 0) {
                            if(res[0][config.settings[i].colname] == null) return `not set yet`;
                            return `<#${res[0][config.settings[i].colname]}>`;
                        }
                    }).catch(err => {
                        console.log(err);
                        return message.channel.send(`${config.errormessages.databasequeryerror}`);
                    });
                }else if(config.settings[i].colname === config.settings.warnroles.colname) {
                    current = database.query(`SELECT * FROM ${message.guild.id}_guild_warnroles`).then(res => {
                        if(res.length > 0) {
                            current = ''; 
                            for(let x in res) {
                                current += `<@&${res[x].role_id}> `;
                            }
                            return current;
                        }
                    }).catch(err => {
                        console.log(err);
                        return message.channel.send(`${config.errormessages.databasequeryerror}`); 
                    })
                }
                else {current = currentsettings[config.settings[i].colname];}

                settingMessage.addField(`${emote} - ${config.settings[i].name}`, `${config.settings[i].desc} \n Current Setting: **${await current ?? 'Not set yet'}** \n **_Exp: ${currentsettings.prefix}settings ${config.settings[i].alias} ${config.settings[i].exp}_**`);
            }
            return message.channel.send({
                embeds: [settingMessage]
            });
        }

    } else {
        /**
         * EDIT SETTING
         */
        setting = setting.replace(value, '').replace(' ', '');
        for (let i in config.settings) {
            if (config.settings[i].alias === setting) {
                
                //? CHECK THE VALUE INPUT
                if (typeof value == config.settings[i].val == false && config.settings[i].val !== 'boolean' && config.settings[i].val !== 'mention' && config.settings[i].val !== 'time') {
                    return message.reply(`Value has to be ${config.settings[i].val}`)
                } else if (config.settings[i].val === 'boolean'){
                    if (value !== 'true' && value !== 'false') return message.reply(`Value has to be true or false`)
                }else if (config.settings[i].val === 'time') {
                    if(!value.endsWith('s') && !value.endsWith('m') && !value.endsWith('h') && !value.endsWith('d')) return message.reply(`Value has to be time (e.g. 1m or 30s)`);
                }

                //? IF SETTING IS PREFIX
                if (setting == config.settings.prefix.alias) {
                    let pass = 0;
                    for (let i in config.settings.prefix.required) {
                        if (!value.endsWith(config.settings.prefix.required[i])) pass++;
                    }
                    if (pass === (config.settings.prefix.required).length) return message.reply(`Invalid prefix`);

                    message.reply(`Prefix succesfully changed to **${value}**`)
                    return saveSetting();
                } 
                //? IF SETTING IS WELCOME_CHANNEL
                else if (setting == config.settings.wc.alias) {
                    //check if channel exists
                    let channel = value.replace('<', '').replace('#', '').replace('>', '')
                    try {
                        message.guild.channels.cache.get(`${channel}`).send(`Just to test my permissions!`).then(msg => msg.delete());
                    } catch (err) {
                        return message.reply(`Either i don't have permissions to see/write into this channel or this channel doesn't exists`)
                    }
                    message.reply(`${config.settings.wc.name} successfully changed to ${value}`);
                    setting = config.settings.wc.colname
                    value = channel;
                    return saveSetting();
                } 
                //? IF SETTING IS COOLDOWN
                else if (setting == config.settings.cooldown.alias) {
                    let dbtime = getModTime(value);
                    if (dbtime <= 0 || dbtime == false) {
                        value = null;
                        message.reply(`Command Cooldown successfully turned off \n \n**Info: A default Cooldown of 2 Seconds is still enabled to protect the bot from spam!**`);
                    } else {
                        message.reply(`Command Cooldown successfully changed to ${value} \n \n**Info: Cooldown can be interupted when the bot is offline!**`);
                        value = dbtime * 1000;
                    }
                    setting = config.settings.cooldown.colname;
                    return saveSetting();
                } 
                //? IF SETTING IS DELETE MOD COMMAND AFTER USAGE
                else if (setting == config.settings.dmcau.alias) {
                    setting = config.settings.dmcau.colname;
                    if (value == 'false') {
                        value = 0;
                        message.reply(`Mod Commands will **don't** get deleted after usage!`)
                    } else {
                        value = 1;
                        message.reply(`Mod Commands **will** get deleted after usage!`)
                    }
                    return saveSetting();
                } 
                //? IF SETTING IS DELETE COMMAND AFTER USAGE
                else if (setting == config.settings.dcau.alias) {
                    setting = config.settings.dcau.colname;
                    if (value == 'false') {
                        value = 0;
                        message.reply(`Commands will **don't** get deleted after usage!`)
                    } else {
                        value = 1;
                        message.reply(`Commands **will** get deleted after usage!`)
                    }
                    return saveSetting();
                } 
                //? UF SETTING IS JOINROLES
                else if (setting == config.settings.joinroles.alias) {
                    var roles = value.replaceAll('<', '').replaceAll('@', '').replaceAll('&', '').replaceAll('!', '').replaceAll('>', '');
                    roles = roles.split(' ');

                    const database = new Database();
                    var removedRoles = '';
                    let checkroles = database.query(`SELECT * FROM ${message.guild.id}_guild_joinroles`).then(res => {
                        if(res.length > 0) { //? ROLES AREADY EXISTS
                            for(let i in res) {
                                for(let x in roles) {
                                    if(res[i].role_id === roles[x]) {
                                        database.query(`DELETE FROM ${message.guild.id}_guild_joinroles WHERE role_id = ?`, [roles[x]]).catch(err => {console.log(err); message.channel.send(`${config.errormessages.databasequeryerror}`)});
                                        removedRoles += `<@&${roles[x]}> `;
                                        roles[x] = '';
                                    }
                                }
                            }
                        }
                        if(removedRoles !== '') {
                            message.reply(`${removedRoles} got removed from joinroles.`).then(msg => returnMessage = null)
                        }
                        return true;
                    });
                    if(await checkroles && roles[0] !== '') {
                        var passedRoles = [];
                        for(let i in roles) {
                            try {
                                var role = message.guild.roles.cache.get(roles[i]);
                            }catch(err) {
                                return message.reply(`${roles[i]} doesn't exists! All existing mentions before are saved.`)
                            }
                            try {
                                if(!message.member.roles.cache.find(r => r.id.toString() === role.id.toString())) {
                                    await message.member.roles.add(role);
                                    await message.member.roles.remove(role);
                                }else {
                                    await message.member.roles.remove(role);
                                    await message.member.roles.add(role);
                                }
                            }catch(err) {
                                return message.reply(`I don't have the permission to add this role: **${role.name}**`);
                            }
                            passedRoles.push(role.id);
                        }
                        for(let i in passedRoles) {
                            saveJoinRoles(passedRoles[i]);
                        }
                        return message.reply(`Roles saved to Joinroles.`)
                    }else {
                        return;
                    }


                    function saveJoinRoles(role) {
                        database.query(`INSERT INTO ${message.guild.id}_guild_joinroles (role_id) VALUES (?)`, [role]).catch(err => {
                            console.log(err);
                            return message.channel.send(`${config.errormessages.databasequeryerror}`);
                        })
                    }

                }
                //? IF SETTING IS AUDIT-LOG
                //? IF SETTING IS MESSAGE-LOG
                //? IF SETTING IS MOD-LOG
                else if (setting == config.settings.auditlog.alias || setting == config.settings.messagelog.alias || setting == config.settings.modlog.alias) {
                    
                    var channel = value.replace('<', '').replace('#', '').replace('>', '');
                    channel = message.guild.channels.cache.get(channel)
                    try {
                        let embed = new MessageEmbed()
                            .setTitle('Test')
                            .addField('To test', 'my permissions')
                        channel.send({embeds: [embed]}).then(msg => msg.delete());
                    }catch(err) {
                        return message.reply(`I don't have permissions to write into this channel!`);
                    }
                    var dbcol;

                    switch(true) {
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
                    const database = new Database();
                    database.query(`UPDATE ${message.guild.id}_guild_logs SET ${dbcol} = ? WHERE id = 1`, [channel.id]).then(() => {
                        return message.reply(`${channel} successfully saved!`);
                    }).catch(err => {
                        console.log(err);
                        return message.channel.send(`${config.errormessages.databasequeryerror}`);
                    });
                }
                //? IF SETTING IS WARNROLES
                else if(setting == config.settings.warnroles.alias) {
                    var roles = value.replaceAll('<', '').replaceAll('@', '').replaceAll('&', '').replaceAll('!', '').replaceAll('>', '');
                    roles = roles.split(' ');

                    const database = new Database();
                    database.query(`DELETE FROM ${message.guild.id}_guild_warnroles`).catch(err => {
                        console.log(err);
                        return message.channel.send(`${config.errormessages.databasequeryerror}`);
                    });

                    for(let i in roles) {
                        try {
                            var role = message.guild.roles.cache.get(roles[i]);
                        }catch(err) {
                            return message.reply(`${roles[i]} doesn't exists!`)
                        }
                        try {
                            if(!message.member.roles.cache.find(r => r.id.toString() === role.id.toString())) {
                                await message.member.roles.add(role);
                                await message.member.roles.remove(role);
                            }else {
                                await message.member.roles.remove(role);
                                await message.member.roles.add(role);
                            }
                        }catch(err) {
                            return message.reply(`I don't have the permission to add this role: **${role.name}**`);
                        }
                    }
                    for(let i in roles) {
                        database.query(`INSERT INTO ${message.guild.id}_guild_warnroles (${config.settings.warnroles.colname}) VALUES (?)`, [roles[i]]).catch(err => {
                            console.log(err);
                            return message.channel.send(`${config.errormessages.databasequeryerror}`);
                        });
                    }
                    return message.reply(`Warn roles successfully saved! \n \n To check these roles write !settings ${config.settings.warnroles.alias}`)
                }
                continue;
            }
        }

        function saveSetting() {
            const database = new Database();
            database.query(`UPDATE ${message.guild.id}_config SET ${setting} = ?`, [value]).catch(err => {
                console.log(err);
                return message.channel.send(`${config.errormessages.databasequeryerror}`);
            });
        }
    }


}

module.exports.help = {
    name: "settings"
}