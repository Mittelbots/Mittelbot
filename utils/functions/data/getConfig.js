const database = require("../../../src/db/db");
const {
    errorhandler
} = require("../errorhandler/errorhandler");
const {
    getAllGuildIds
} = require("./getAllGuildIds");
const {
    getFromCache,
    config
} = require('../cache/cache');
const config_file = require('../../../src/assets/json/_config/config.json');

module.exports.getAllConfig = async () => {
    const all_guild_id = await getAllGuildIds();

    if (all_guild_id) {
        let response = [];
        for (let i in all_guild_id) {
            response.push(await this.getConfig({
                guild_id: all_guild_id[i].guild_id
            }));
        }
        return response;
    } else {
        return false;
    }
}


module.exports.getConfig = async ({
    guild_id
}) => {

    const cache = await getFromCache({
        cacheName: "config",
        param_id: guild_id
    });
    if (cache.length > 0) {
        return cache[0];
    }

    return await database.query(`SELECT * FROM ${guild_id}_config`)
        .then(res => {
            if (res.length > 0) {
                return res[0];
            } else {
                return false;
            }
        })
        .catch(err => {
            errorhandler({
                err: err,
                fatal: true
            });
            return false;
        });
}

module.exports.updateConfig = async ({guild_id, value, valueName}) => {

    for(let i in config) {
        if(config[i].id === guild_id) {
            config[i][valueName] = value;
        }
    }

    return await database.query(`UPDATE ${guild_id}_config SET ${valueName} = ?`, [value])
        .then(() => {
            return true;
        })
        .catch(err => {
            errorhandler({err, fatal: true});
            return false;
        });
}




//######################################################################################################################
//? PREFIX


module.exports.checkPrefix = async ({
    value
}) => {
    let pass = 0;
    for (let i in config_file.settings.prefix.required) {
        if (!value.endsWith(config_file.settings.prefix.required[i])) pass++;
    }
    if (pass === (config_file.settings.prefix.required).length) return false

    return true;
}