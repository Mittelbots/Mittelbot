const { GuildConfig } = require('./Config');
const { errorhandler } = require('../errorhandler/errorhandler');
const translatte = require('translatte');

module.exports.getTranslateConfig = async ({ guild_id }) => {
    return new Promise(async (resolve, reject) => {
        const { translate_log_channel, translate_language, translate_target } = await GuildConfig.get(guild_id);
        if (translate_log_channel && translate_language && translate_target) {
            return resolve({
                translate_log_channel,
                translate_language,
                translate_target,
            });
        } else {
            return reject(false);
        }
    });
};

module.exports.saveNewTranslateConfig = async ({
    guild_id,
    translate_log_channel,
    translate_language,
    translate_target,
}) => {
    return new Promise(async (resolve, reject) => {
        const logChannel = await GuildConfig.update({
            guild_id,
            value: translate_log_channel,
            valueName: 'translate_log_channel',
        });

        const language = await GuildConfig.update({
            guild_id,
            value: translate_language,
            valueName: 'translate_language',
        });

        const target = await GuildConfig.update({
            guild_id,
            value: translate_target,
            valueName: 'translate_target',
        });

        Promise.all([logChannel, language, target])
            .then((res) => {
                resolve(true);
            })
            .catch((err) => {
                reject(false);
            });
    });
};

module.exports.translateMessage = async ({ message }) => {
    this.getTranslateConfig({
        guild_id: message.guild.id,
    })
        .then((res) => {
            const log = res.translate_log_channel;
            if (message.channel.id === res.translate_target) {
                return translatte(message.content, { to: res.translate_language })
                    .then((res) => {
                        const channel = message.guild.channels.cache.find((c) => c.id === log);
                        if (channel) {
                            channel
                                .send(`${message.author} ${message.channel} | ${res.text}`)
                                .catch((err) => {});
                        }
                    })
                    .catch((err) => {
                        errorhandler({ err: err, fatal: true });
                    });
            }
        })
        .catch((err) => {});
};
