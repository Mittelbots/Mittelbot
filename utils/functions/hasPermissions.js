const { PermissionFlagsBits } = require('discord.js');
const { GuildConfig } = require('./data/Config');
const { errorhandler } = require('./errorhandler/errorhandler');

module.exports.hasPermission = async ({
    guild_id,
    adminOnly,
    modOnly,
    user,
    isDashboard = false,
    bot,
}) => {
    let guild = await bot.guilds.cache.get(guild_id);
    let guildUser = await guild.members.fetch(user.id || user);

    let hasAdminPerms = guildUser.permissions.has(PermissionFlagsBits.Administrator);
    if (hasAdminPerms) return true;

    const { modroles } = await GuildConfig.get(guild_id);

    let hasPermission = false;
    for (let i in modroles) {
        hasPermission = this.checkPerms({
            role_id: modroles[i].role,
            roleIsAdmin: modroles[i].isAdmin,
            roleIsMod: modroles[i].isMod,
            roleIsHelper: modroles[i].isHelper,
            user: guildUser,
            isDashboard,
            modOnly,
            adminOnly,
        });

        if (hasPermission) break;
    }

    if (!hasPermission) {
        errorhandler({
            fatal: false,
            message: `${guildUser.id} has tried a command with no permission in ${guild_id}`,
        });
    }

    return hasPermission;
};

module.exports.checkPerms = ({
    role_id,
    roleIsAdmin,
    roleIsMod,
    roleIsHelper,
    user,
    isDashboard,
    adminOnly,
    modOnly,
}) => {
    let userHasRole;

    if (user.roles.cache.size === 1) {
        return false;
    }

    try {
        if (isDashboard) {
            userHasRole = bot.guilds.cache
                .get(guild_id)
                .members.cache.get(user)
                .roles.cache.find((r) => r.id === role_id);
        } else {
            userHasRole = user.roles.cache.find((r) => r.id === role_id);
        }
    } catch (e) {
        return false;
    }

    if (!userHasRole) {
        return false;
    }
    if (adminOnly && userHasRole && (ismod == 1 || ishelper == 1)) {
        return false;
    }
    if (modOnly && userHasRole && ishelper == 1) {
        return false;
    }
    if (!roleIsAdmin && !roleIsMod && !roleIsHelper) {
        return false;
    }

    return true;
};
