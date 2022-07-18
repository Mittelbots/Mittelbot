const {
    EmbedBuilder
} = require('discord.js');
const config = require('../../../src/assets/json/_config/config.json');
const database = require('../../../src/db/db');
const {
    updateCache,
    getFromCache,
    addToCache,
    addValueToCache
} = require('../cache/cache');
const {
    updateConfig,
    checkPrefix
} = require('../data/getConfig');
const { updateJoinroles, saveJoinRoles } = require('../data/joinroles');
const {
    removeWarnroles, addWarnroles, updateWarnroles
} = require('../data/warnroles');
const {
    errorhandler
} = require('../errorhandler/errorhandler');
const {
    getModTime
} = require('../getModTime');
const { checkRole } = require('../roles/checkRole');


module.exports.editSettings = async ({
    setting,
    value,
    message,
}) => {

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


        
            
            //? IF SETTING IS WARNROLES
            else if (setting == config.settings.warnroles.alias) {

                if (value.toLowerCase() === 'none' || value.toLowerCase() === 'clear') {
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

                return await updateWarnroles({
                    guild_id: message.guild.id,
                    roles,
                    message
                })

            }
            continue;
        }

        async function saveSetting() {
            await updateConfig({
                guild_id: message.guild.id,
                value: value,
                valueName: setting
            })
        }
    }
}