const database = require("../../../src/db/db");
const {
    getFromCache
} = require("../cache/cache");
const {
    errorhandler
} = require("../errorhandler/errorhandler");

module.exports.getAutomodbyGuild = async (guild_id) => {
    const cache = await getFromCache({
        cacheName: "guild_automod",
        param_id: guild_id
    });

    if (!cache || cache.length === 0) {

        return await database.query(`SELECT * FROM guild_automod WHERE guild_id = ?`, [guild_id])
            .then(res => {
                return res[0].settings;
            })
            .catch(err => {
                errorhandler({
                    err,
                    fatal: true
                })
                return false;
            })

    } else {
        return cache[0];
    }
}

module.exports.updateAutoModbyGuild = async ({
    guild_id,
    value,
    type
}) => {
    return new Promise(async (resolve, reject) => {
        const cache = await getFromCache({
            cacheName: "guild_automod",
            param_id: guild_id
        });

        if (!cache || cache.length === 0) {
            for (let i in cache[0]) {
                console.log(cache[0][i]);
            }
        }


        return await database.query(`UPDATE guild_automod SET settings = ? WHERE guild_id = ?`, [value, guild_id])
            .then(() => {
                return resolve(`✅ Successfully updated automod settings for your guild to \`${type}\`.`);
            })
            .catch(err => {
                errorhandler({
                    err,
                    fatal: true
                })
                return reject(`❌ Error updating automod settings for your guild to \`${type}\`.`);
            })
    })
}