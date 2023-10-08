const GuildConfig = require('./Config');
const { errorhandler } = require('~utils/functions/errorhandler/errorhandler');
const translatte = require('translatte');

class Translate {
    constructor() {
        this.defaultTranslateConfig = {
            mode: 'disable',
            translate_language: 'en',
            translate_target: '',
            translate_log_channel: '',
        };
    }

    get(guild_id) {
        return new Promise(async (resolve, reject) => {
            let translateConfig = await new GuildConfig().get(guild_id);
            try {
                translateConfig = translateConfig.translate;
            } catch (err) {
                if (translateConfig !== typeof object) {
                    translateConfig = this.defaultTranslateConfig;
                }
            }
            if (
                translateConfig.translate_log_channel &&
                translateConfig.translate_language &&
                translateConfig.translate_target
            ) {
                return resolve(translateConfig);
            } else {
                return reject(false);
            }
        });
    }

    translate(message) {
        return new Promise(async (resolve, reject) => {
            await this.get(message.guild.id)
                .then(async (res) => {
                    const translateConfig = res;

                    const isActive = translateConfig.mode === 'enable';
                    if (!isActive || message.channel.id !== translateConfig.translate_target)
                        return resolve();

                    await translatte(message.content, {
                        to: translateConfig.translate_language,
                    })
                        .then((res) => {
                            const channel = message.guild.channels.cache.find(
                                (c) => c.id === translateConfig.translate_log_channel
                            );
                            if (channel) {
                                channel
                                    .send(`${message.author} ${message.channel} | ${res.text}`)
                                    .catch((err) => {});
                            }

                            return resolve();
                        })
                        .catch((err) => {
                            errorhandler({ err });
                            return reject(err);
                        });
                })
                .catch((err) => {});
        });
    }
}

module.exports = Translate;
