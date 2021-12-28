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
        }).catch(err => console.log(err));

        currentsettings = await currentsettings;

        var passed = false;
        for (let i in config.settings) {
            if (setting == config.settings[i].alias) {
                passed = true;
                return viewSetting(config.settings[i].name, config.settings[i].desc, config.settings[i].icon, currentsettings[config.settings[i].colname])
            }
        }
        if (!passed) viewAllSettings();

        async function getEmote(id) {
            return bot.guilds.cache.get(config.DEVELOPER_DISCORD_GUILD_ID).emojis.cache.get(id);
        }

        async function viewAllSettings() {
            let settingMessage = new MessageEmbed()
                .setTitle(`**Settings for ${message.guild.name}**`)
                .setDescription(`**Change or view Settings**`);

            for (let i in config.settings) {
                let emote = await getEmote(config.settings[i].icon);
                settingMessage.addField(`${emote} - ${config.settings[i].name}`, `${config.settings[i].desc} \n Current Setting: **${currentsettings[config.settings[i].colname] ?? 'Not set yet'}**`);
            }
            return message.channel.send({
                embeds: [settingMessage]
            });
        }

        async function viewSetting(sett_name, sett_desc, sett_icon, current) {
            let emote = await getEmote(sett_icon);
            let settingMessage = new MessageEmbed()
                .setTitle(`**Settings for ${message.guild.name}**`)
                .setDescription(`**Change or view Settings**`)
                .addField(`${emote} - ${sett_name}`, `${sett_desc} \n Current Setting: **${current ?? 'Not set yet'}**`)
                .setTimestamp();

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
                if (typeof value == config.settings[i].val == false && config.settings[i].val !== 'boolean' && config.settings[i].val !== 'mention' && config.settings[i].val !== 'time') {
                    return message.reply(`Value has to be ${config.settings[i].val}`)
                } else if (config.settings[i].val === 'boolean'){
                    if (value !== 'true' && value !== 'false') return message.reply(`Value has to be true or false`)
                }else if (config.settings[i].val === 'time') {
                    if(!value.endsWith('s') && !value.endsWith('m') && !value.endsWith('h') && !value.endsWith('d')) return message.reply(`Value has to be time (e.g. 1m or 30s)`);
                }

                if (setting == config.settings.prefix.alias) {
                    let pass = 0;
                    for (let i in config.settings.prefix.required) {
                        if (!value.endsWith(config.settings.prefix.required[i])) pass++;
                    }
                    if (pass === (config.settings.prefix.required).length) return message.reply(`Invalid prefix`);

                    message.reply(`Prefix succesfully changed to **${value}**`)
                    return saveSetting();
                } else if (setting == config.settings.wc.alias) {
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
                } else if (setting == config.settings.cooldown.alias) {
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
                } else if (setting == config.settings.dmcau.alias) {
                    setting = config.settings.dmcau.colname;
                    if (value == 'false') {
                        value = 0;
                        message.reply(`Mod Commands will **don't** get deleted after usage!`)
                    } else {
                        value = 1;
                        message.reply(`Mod Commands **will** get deleted after usage!`)
                    }
                    return saveSetting();
                } else if (setting == config.settings.dcau.alias) {
                    setting = config.settings.dcau.colname;
                    if (value == 'false') {
                        value = 0;
                        message.reply(`Commands will **don't** get deleted after usage!`)
                    } else {
                        value = 1;
                        message.reply(`Commands **will** get deleted after usage!`)
                    }
                    return saveSetting();
                } else if (setting == config.settings.joinroles.alias) {
                    let roles = value.replaceAll('<', '').replaceAll('@', '').replaceAll('&', '').replaceAll('!', '').replaceAll('>', '');
                    roles = roles.split(' ');
                    const database = new Database();
                    database.query(`SELECT * FROM ${message.guild.id}_guild_joinroles`).then(res => {
                        if (res.length !== 0) {
                            for (let i in res) {
                                if (roles[i].search(res[i].role_id) !== -1) {
                                    database.query(`DELETE FROM ${message.guild.id}_guild_joinroles WHERE role_id = ?`, [res[i].role_id]).catch(err => message.channel.send(`${config.errormessages.databasequeryerror}`));
                                    message.reply(`<@&${roles[i]}> removed from joinroles`)
                                } else {
                                    try {
                                        message.guild.roles.cache.get(roles[i]);
                                    } catch (err) {
                                        console.log(err);
                                        return message.reply(`${roles[i]} doesn't exists!`)
                                    }
                                }
                            }
                        }else {
                            for(let i in roles) {
                                try {
                                    message.guild.roles.cache.get(roles[i]);
                                }catch(err) {
                                    return message.reply(`${roles[i]} doesn't exists! All existing mentions before are saved.`)
                                }
                                database.query(`INSERT INTO ${message.guild.id}_guild_joinroles (role_id) VALUES (?)`, [roles[i]]).catch(err => {
                                    console.log(err);
                                    return message.channel.send(`${config.errormessages.databasequeryerror}`);
                                })
                            }
                            return message.reply(`${value} saved as Joinrole(s)`)
                        }
                    });
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