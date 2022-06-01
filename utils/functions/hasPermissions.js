const database = require("../../src/db/db");
const config = require('../../src/assets/json/_config/config.json');
const { getFromCache } = require("./cache/cache");


async function hasPermission(message, adminOnly, modOnly) {
    //if(message.user.id === config.Bot_Owner_ID && config.debug == 'true') return true;

    const cache = await getFromCache({
        cacheName: 'modroles',
        param_id: message.guild.id
    });

    var role_id;
    var isadmin;
    var ismod;
    var ishelper;
    if(!cache) {
        return await database.query(`SELECT * FROM ${message.guild.id}_guild_modroles`).then(async (res) => {
            var hasPermission = false
            for (let i in await res) {
                role_id = res[i].role_id;
                isadmin = res[i].isadmin;
                ismod = res[i].ismod;
                ishelper = res[i].ishelper;

                hasPermission = checkPerms({role_id, isadmin, ismod, ishelper});
            }
            return hasPermission;
        }).catch(err => console.log(err))

    }else {
        for (let i in cache[0].modroles) {
            role_id = cache[0].modroles[i].role_id;
            isadmin = cache[0].modroles[i].isadmin;
            ismod = cache[0].modroles[i].ismod;
            ishelper = cache[0].modroles[i].ishelper;

            hasPermission = checkPerms({role_id, isadmin, ismod, ishelper});
        }
        return hasPermission;
    }

    function checkPerms({role_id, isadmin, ismod, ishelper}) {
        const userHasRole = message.member.roles.cache.find(r => r.id === role_id);

        if(userHasRole) {
            if(adminOnly && userHasRole && (ismod == 1 || ishelper == 1)) return false;
            if(modOnly && userHasRole && ishelper == 1) {return false};
            if (userHasRole) { 
                return true;
            }
        }else {
            return false;
        }
    }
}

module.exports = {hasPermission}