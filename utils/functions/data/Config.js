const { errorhandler } = require('../errorhandler/errorhandler');
const config_file = require('../../../src/assets/json/_config/config.json');
const guildConfig = require('../../../src/db/Models/tables/guildConfig.model');
const { Guilds } = require('./Guilds');

class GuildConfig {
    constructor() {}

    add(guild_id) {
        return new Promise(async (resolve, reject) => {
            await guildConfig
                .create(
                    {
                        guild_id,
                    },
                    {
                        ignoreDuplicates: true,
                    }
                )
                .then(() => {
                    resolve(true);
                })
                .catch((err) => {
                    errorhandler({ err });
                    return reject(false);
                });
        });
    }

    get(guild_id) {
        return new Promise(async (resolve, reject) => {
            const guild = await Guilds.get(guild_id).catch((err) => {});
            if (!guild) 
            return resolve(false);
            try {
                return resolve(await guild.getConfig());
            } catch (err) {
                errorhandler({ err });
                return resolve([]);
            }
        });
    }

    update({ guild_id, value, valueName }) {
        return new Promise(async (resolve, reject) => {
            await guildConfig
                .update(
                    {
                        [valueName]: value,
                    },
                    {
                        where: {
                            guild_id,
                        },
                    }
                )
                .then(() => {
                    return resolve(true);
                })
                .catch((err) => {
                    errorhandler({ err });
                    return reject(err);
                });
        });
    }

    checkPrefix({ value }) {
        return new Promise(async (resolve, reject) => {
            let pass = 0;
            for (let i in config_file.settings.prefix.required) {
                if (!value.endsWith(config_file.settings.prefix.required[i])) pass++;
            }
            if (pass === config_file.settings.prefix.required.length) return resolve(false);

            return resolve(true);
        });
    }
}

module.exports.GuildConfig = new GuildConfig();
