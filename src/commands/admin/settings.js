const config = require('../../../config.json');
const { hasPermission } = require('../../../utils/functions/hasPermissions');
const {MessageEmbed, Permissions} = require('discord.js');
const {Database} = require('../../db/db');

module.exports.run = async (bot, message, args) => {
    if(config.deleteModCommandsAfterUsage  == 'true') {
        message.delete();
    }
    if(!message.member.permissions.has(Permissions.FLAGS.ADMINISTRATOR)) {
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
    if(value == '') {
        const database = new Database();
        var currentsettings = database.query(`SELECT * FROM ${message.guild.id}_config LIMIT 1`).then(async res => {
        return await res[0];
        }).catch(err => console.log(err));

        currentsettings = await currentsettings;

        var passed = false;
        for(let i in config.settings) {
            if(setting == config.settings[i].alias) {
                passed = true;
                return viewSetting(config.settings[i].name, config.settings[i].desc, config.settings[i].icon, currentsettings[config.settings[i].colname])
            }
        }
        if(!passed) viewAllSettings();

        async function getEmote(id) {
            return bot.guilds.cache.get(config.DEVELOPER_DISCORD_GUILD_ID).emojis.cache.get(id);
        }

        async function viewAllSettings() {
            let settingMessage = new MessageEmbed()
            .setTitle(`**Settings for ${message.guild.name}**`)
            .setDescription(`**Change or view Settings**`);

            for(let i in config.settings) {
                let emote = await getEmote(config.settings[i].icon);
                settingMessage.addField(`${emote} - ${config.settings[i].name}`, `${config.settings[i].desc} \n Current Setting: **${currentsettings[config.settings[i].colname] ?? 'Not set yet'}**`);
            }
            return message.channel.send({embeds: [settingMessage]});
        }

        async function viewSetting(sett_name, sett_desc, sett_icon, current) {
            let emote = await getEmote(sett_icon);
            let settingMessage = new MessageEmbed()
            .setTitle(`**Settings for ${message.guild.name}**`)
            .setDescription(`**Change or view Settings**`)
            .addField(`${emote} - ${sett_name}`, `${sett_desc} \n Current Setting: **${current ?? 'Not set yet'}**`)
            .setTimestamp();

            return message.channel.send({embeds: [settingMessage]});
        }
    }else {
    /**
     * EDIT SETTING
     */
        setting = setting.replace(value, '').replace(' ', '');
        for(let i in config.settings) {
            if(config.settings[i].alias === setting) {
                if(typeof value == config.settings[i].val == false) {
                    return message.reply(`Value has to be ${config.settings[i].val}`)
                }
                if(setting == config.settings.prefix.alias) {
                    let pass = 0;
                    for(let i in config.settings.prefix.required) {
                        if(!value.endsWith(config.settings.prefix.required[i])) pass++;
                    }
                    if(pass === (config.settings.prefix.required).length) return message.reply(`Invalid prefix`);

                    message.reply(`Prefix succesfully changed to **${value}**`)
                }else if(setting == config.settings[i].alias) {
                    //check if channel exists
                    let channel = value.replace('<', '').replace('#', '').replace('>', '')
                    try {
                        message.guild.channels.cache.get(`${channel}`).send(`Just to test my permissions!`).then(msg => msg.delete());
                    }catch(err) {
                        return message.reply(`Either i don't have permissions to see/write into this channel or this channel doesn't exists`)
                    }
                    message.reply(`${config.settings.wc.name} successfully changed to ${value}`);
                    setting = config.settings.wc.colname
                    value = channel;
                }

                const database = new Database();
                database.query(`UPDATE ${message.guild.id}_config SET ${setting} = ?`, [value]).catch(err => {
                    console.log(err);
                    return message.channel.send(`${config.errormessages.databasequeryerror}`);
                });
                continue;
            }
        }
    }


}

module.exports.help = {
    name:"settings"
}