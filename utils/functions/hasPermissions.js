const database = require("../../src/db/db");
const {
    getFromCache
} = require("./cache/cache");


async function hasPermission({
    guild_id,
    adminOnly,
    modOnly,
    user,
    isDashboard,
    bot
}) {

    const cache = await getFromCache({
        cacheName: 'modroles',
        param_id: guild_id
    });

    var role_id;
    var isadmin;
    var ismod;
    var ishelper;
    if (!cache) {
        return await database.query(`SELECT * FROM ${guild_id}_guild_modroles`).then(async (res) => {
            var hasPermission = false
            for (let i in await res) {
                role_id = res[i].role_id;
                isadmin = res[i].isadmin;
                ismod = res[i].ismod;
                ishelper = res[i].ishelper;

                hasPermission = checkPerms({
                    role_id,
                    isadmin,
                    ismod,
                    ishelper
                });
                if (hasPermission) break;
            }
            return hasPermission;
        }).catch(err => console.log(err))

    } else {
        for (let i in cache[0].modroles) {
            role_id = cache[0].modroles[i].role_id;
            isadmin = cache[0].modroles[i].isadmin;
            ismod = cache[0].modroles[i].ismod;
            ishelper = cache[0].modroles[i].ishelper;

            hasPermission = checkPerms({
                role_id,
                isadmin,
                ismod,
                ishelper
            });
            if (hasPermission) break;
        }
        return hasPermission;
    }

    function checkPerms({
        role_id,
        isadmin,
        ismod,
        ishelper
    }) {
        var userHasRole;

        try {
            if (isDashboard) {
                userHasRole = bot.guilds.cache.get(guild_id).members.cache.get(user).roles.cache.find(r => r.id === role_id);
            } else {
                userHasRole = user.roles.cache.find(r => r.id === role_id);
            }
        } catch (e) {
            return false;
        }

        if (userHasRole) {
            if (adminOnly && userHasRole && (ismod == 1 || ishelper == 1)) return false;
            if (modOnly && userHasRole && ishelper == 1) {
                return false
            };
            if (!isadmin && !ismod && !ishelper) return false;
            if (userHasRole) {
                return true;
            }
        } else {
            return false;
        }
    }
}

module.exports = {
    hasPermission
}