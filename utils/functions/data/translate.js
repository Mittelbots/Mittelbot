const { getConfig } = require("./getConfig");
const database = require("../../../src/db/db");
const {
    config
} = require('../cache/cache');
const { errorhandler } = require("../errorhandler/errorhandler");
const translatte = require('translatte');

module.exports.getTranslateConfig = async ({
    guild_id
}) => {
    return new Promise(async (resolve, reject) => {
        const {translate_log_channel, translate_language, translate_target} = await getConfig({
            guild_id
        });
        if(translate_log_channel && translate_language && translate_target)  {
            return resolve({
                translate_log_channel,
                translate_language,
                translate_target
            });
        }else {
            return reject(false);
        }
    });
}

module.exports.saveNewTranslateConfig = async ({
    guild_id,
    translate_log_channel,
    translate_language,
    translate_target
}) => {
    return new Promise(async (resolve, reject) => {

        for(let i in config) {
            if(config[i].id === guild_id) {
                config[i].translate_log_channel = translate_log_channel;
                config[i].translate_language = translate_language;
                config[i].translate_target = translate_target;
            }
        }

        await database.query(`UPDATE ${guild_id}_config SET translate_log_channel = ?, translate_language = ?, translate_target = ? WHERE id = 1`, [translate_log_channel, translate_language, translate_target])
            .then(() => {
                return resolve(true);
            }).catch(err => {
                reject(false);
                return errorhandler({
                    err: err,
                    fatal: true
                })
            })
    }); 
}


module.exports.translateMessage = async ({message}) => {
    this.getTranslateConfig({
        guild_id: message.guild.id
    }).then(res => {
        const log = res.translate_log_channel;
        if(message.channel.id === res.translate_target) {
            translatte(message.content, {to: res.translate_language}).then(res => {
                const channel = message.guild.channels.cache.find(c => c.id === log);
                if(channel) {
                    channel.send(`${message.author} ${message.channel} | ${res.text}`).catch(err => {});
                }
            }).catch(err => {
                errorhandler({err: err, fatal: true});
            });
        }
    }).catch(err => {
        console.log(err)
    })

}