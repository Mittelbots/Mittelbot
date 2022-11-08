<<<<<<< HEAD
const { GuildConfig } = require('./Config');
const { errorhandler } = require('../errorhandler/errorhandler');
=======
const { getGuildConfig, updateGuildConfig } = require("./getConfig");
const {
    guildConfig
} = require('../cache/cache');
const { errorhandler } = require("../errorhandler/errorhandler");
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f
const translatte = require('translatte');

module.exports.getTranslateConfig = async ({
    guild_id
}) => {
    return new Promise(async (resolve, reject) => {
<<<<<<< HEAD
        const { translate_log_channel, translate_language, translate_target } =
            await GuildConfig.get(guild_id);
        if (translate_log_channel && translate_language && translate_target) {
=======
        const {translate_log_channel, translate_language, translate_target} = await getGuildConfig({
            guild_id
        });
        if(translate_log_channel && translate_language && translate_target)  {
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f
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
<<<<<<< HEAD
        const logChannel = await GuildConfig.update({
=======

        for(let i in guildConfig) {
            if(guildConfig[i].id === guild_id) {
                guildConfig[i].translate_log_channel = translate_log_channel;
                guildConfig[i].translate_language = translate_language;
                guildConfig[i].translate_target = translate_target;
            }
        }

        const logChannel = await updateGuildConfig({
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f
            guild_id,
            value: translate_log_channel,
            valueName: "translate_log_channel"
        });

        const language = await GuildConfig.update({
            guild_id,
            value: translate_language,
            valueName: "translate_language"
        });

        const target = await GuildConfig.update({
            guild_id,
            value: translate_target,
            valueName: "translate_target"
        })

        Promise.all([logChannel, language, target]).then((res) => {
            resolve(true)
        }).catch(err => {
            reject(false)
        })
    }); 
}


module.exports.translateMessage = async ({message}) => {
    this.getTranslateConfig({
        guild_id: message.guild.id
    }).then(res => {
        const log = res.translate_log_channel;
        if(message.channel.id === res.translate_target) {
            return translatte(message.content, {to: res.translate_language}).then(res => {
                const channel = message.guild.channels.cache.find(c => c.id === log);
                if(channel) {
                    channel.send(`${message.author} ${message.channel} | ${res.text}`).catch(err => {});
                }
            }).catch(err => {
                errorhandler({err: err, fatal: true});
            });
        }
    }).catch(err => {})

}