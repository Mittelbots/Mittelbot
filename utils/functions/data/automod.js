const database = require("../../../src/db/db");
const {
    getFromCache,
    autoMod
} = require("../cache/cache");
const {
    errorhandler
} = require("../errorhandler/errorhandler");
const {
    getAllGuildIds
} = require("./getAllGuildIds");

module.exports.getAutomodbyGuild = async (guild_id) => {
    const cache = await getFromCache({
        cacheName: "autoMod",
        param_id: guild_id
    });

    if (!cache || cache.length === 0) {

        return await database.query(`SELECT * FROM guild_automod WHERE guild_id = ?`, [guild_id])
            .then(res => {
                if (res.length > 0) {
                    return res[0].settings;
                } else {
                    return false;
                }
            })
            .catch(err => {
                errorhandler({
                    err,
                    fatal: true
                })
                return false;
            })

    } else {
        return cache[0].settings;
    }
}

module.exports.getAllAutoMod = async () => {
    const all_guild_id = await getAllGuildIds();

    if (all_guild_id) {
        let response = [];
        for (let i in all_guild_id) {
            response.push({
                guild_id: all_guild_id[i].guild_id,
                setting: await this.getAutomodbyGuild(all_guild_id[i].guild_id)
            });
        }
        return response;
    } else {
        return false;
    }
}

module.exports.updateAutoModbyGuild = async ({
    guild_id,
    value,
    type
}) => {
    return new Promise(async (resolve, reject) => {

        for (let i in autoMod) {
            if (autoMod[i].id === guild_id) {
                autoMod[i].settings = value;
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

module.exports.isOnWhitelist = ({
    setting,
    user_roles,
}) => {
    let whitelist = JSON.parse(setting).whitelistrole;
    if(!whitelist) return false;

    user_roles = user_roles.map(role => role.id);
    whitelist = whitelist.roles.filter(r => user_roles.includes(r));

    return (whitelist.length > 0) ? true : false;

}

module.exports.isRoleOnWhitelist = ({
    setting,
    role_id
}) => {
    const whitelist = JSON.parse(setting).whitelistrole;
    if(!whitelist) return false;

    return (whitelist.roles.includes(role_id)) ? true : false;
}