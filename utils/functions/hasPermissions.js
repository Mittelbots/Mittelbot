const {
    PermissionFlagsBits
} = require("discord.js");
const {
    getGuildConfig
} = require("./data/getConfig");
const {
    errorhandler
} = require("./errorhandler/errorhandler");
const config = require('../../src/assets/json/_config/config.json');


module.exports.hasPermission = async({
    guild_id,
    adminOnly,
    modOnly,
    user,
    isDashboard = false,
    bot
}) => {
    let guildUser = bot.guilds.cache.get(guild_id).members.cache.get(user.id || user);
    let hasAdminPerms = guildUser.permissions.has(PermissionFlagsBits.Administrator);

    if (hasAdminPerms && !config.debug) return true;


    const {
        settings
    } = await getGuildConfig({
        guild_id
    });

    const modroles = JSON.parse(settings.modroles) || settings.modroles || [];

    var role_id;
    var isadmin;
    var ismod;
    var ishelper;

    var hasPermission = false
    for (let i in modroles) {
        role_id = modroles[i].role;
        isadmin = modroles[i].isadmin;
        ismod = modroles[i].ismod;
        ishelper = modroles[i].ishelper;

        hasPermission = this.checkPerms({
            role_id,
            isadmin,
            ismod,
            ishelper,
            user: guildUser,
            isDashboard,
            modOnly,
            adminOnly
        });

        if (hasPermission) break;
    }

    if(!hasPermission) {
        errorhandler({
            fatal: false,
            message: `${guildUser.id} has tried a command with no permission in ${guild_id}`
        });
    }

    return hasPermission;
}

module.exports.checkPerms = ({
    role_id,
    isadmin,
    ismod,
    ishelper,
    user,
    isDashboard,
    adminOnly,
    modOnly
}) => {
    var userHasRole;

    if(user.roles.cache.size === 1) {
        return false
    };

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