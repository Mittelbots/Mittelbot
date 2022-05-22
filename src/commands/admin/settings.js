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
const database = require('../../db/db');
const {
    errorhandler
} = require('../../../utils/functions/errorhandler/errorhandler');
const { viewAllSettings } = require('../../../utils/functions/settings/viewAllSettings');
const { editSettings } = require('../../../utils/functions/settings/editSettings');

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
        var currentsettings = await database.query(`SELECT * FROM ${message.guild.id}_config LIMIT 1`).then(async res => {
            return await res[0];
        }).catch(err => {
            errorhandler({err, fatal: true});
            return message.channel.send(`${config.errormessages.databasequeryerror}`).catch(err => {});
        });

        var passed = false;
        for (let i in config.settings) {
            if (setting == config.settings[i].alias) {
                passed = true;
                return viewSetting(bot, message, config.settings[i].name, config.settings[i].desc, config.settings[i].icon, currentsettings[config.settings[i].colname], `**_Exp: ${currentsettings.prefix}settings ${config.settings[i].alias} ${config.settings[i].exp}_**`)
            }
        }
        if (!passed) return await viewAllSettings({
            currentsettings,
            message,
            bot
        })


        

    } else {
        /**
         *? EDIT SETTING
         */

        setting = setting.replace(value, '').replace(' ', '');
        
        return await editSettings({
            setting,
            value,
            message
        });
    }


}

module.exports.help = cmd_help.admin.settings;