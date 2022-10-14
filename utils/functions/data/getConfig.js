const database = require('../../../src/db/db');
const { errorhandler } = require('../errorhandler/errorhandler');
const { getFromCache, guildConfig } = require('../cache/cache');
const config_file = require('../../../src/assets/json/_config/config.json');

module.exports.insertGuildIntoGuildConfig = async (guild_id) => {
    return new Promise(async (resolve, reject) => {
        await database
            .query(
                `INSERT IGNORE INTO guild_config (guild_id) VALUES (?); SELECT * FROM guild_config WHERE guild_id = ?`,
                [guild_id, guild_id]
            )
            .then((res) => {
                guildConfig[guildConfig.length] = {
                    name: 'guildConfig',
                    id: guild_id,
                    settings: Object.values(JSON.parse(JSON.stringify(res[1])))[0], // removes rowdatapacket object
                };
                return resolve(true);
            })
            .catch((err) => {
                errorhandler({ err });
                return reject(false);
            });
    });
};

module.exports.getGuildConfig = async ({ guild_id }) => {
    const cache = await getFromCache({
        cacheName: 'guildConfig',
        param_id: guild_id,
    });
    if (cache.length > 0) {
        return cache[0];
    }

    return await database
        .query(`SELECT * FROM guild_config`)
        .then((res) => {
            if (res.length > 0) {
                return res[0];
            } else {
                return false;
            }
        })
        .catch((err) => {
            errorhandler({
                err: err,
                fatal: true,
            });
            return false;
        });
};

module.exports.updateGuildConfig = async ({ guild_id, value, valueName }) => {
    return new Promise(async (resolve, reject) => {
        for (let i in guildConfig) {
            if (guildConfig[i].id === guild_id) {
                guildConfig[i].settings[valueName] = value;
            }
        }

        return await database
            .query(`UPDATE guild_config SET ${valueName} = ? WHERE guild_id = ?`, [value, guild_id])
            .then(() => {
                return resolve(true);
            })
            .catch((err) => {
                errorhandler({
                    err,
                    fatal: true,
                });
                return reject(false);
            });
    });
};

module.exports.getAllGuildConfig = async () => {
    return await database
        .query(`SELECT * FROM guild_config`)
        .then((res) => {
            if (res.length > 0) {
                return res;
            } else {
                return false;
            }
        })
        .catch((err) => {
            errorhandler({
                err,
                fatal: true,
            });
            return false;
        });
};

//######################################################################################################################
//? PREFIX

module.exports.checkPrefix = async ({ value }) => {
    let pass = 0;
    for (let i in config_file.settings.prefix.required) {
        if (!value.endsWith(config_file.settings.prefix.required[i])) pass++;
    }
    if (pass === config_file.settings.prefix.required.length) return false;

    return true;
};
