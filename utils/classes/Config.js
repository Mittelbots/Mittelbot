const guildConfig = require('~src/db/Models/guildConfig.model');
const Guilds = require('./Guilds');

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
                    return reject(false);
                });
        });
    }

    get(guild_id) {
        return new Promise(async (resolve) => {
            const guild = await new Guilds().get(guild_id).catch(() => {});
            if (!guild) return resolve(false);
            try {
                return resolve(await guild.getConfig());
            } catch (err) {
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
                    return reject(err);
                });
        });
    }
}

module.exports = GuildConfig;
