const { PermissionFlagsBits } = require('discord.js');
const GuildConfig = require('~utils/classes/Config');
const { errorhandler } = require('./errorhandler/errorhandler');

module.exports.hasPermission = async ({
    guild_id,
    adminOnly,
    modOnly,
    user,
    isDashboard = false,
    bot,
}) => {
    const guild = await bot.guilds.fetch(guild_id);
    const guildUser = await guild.members.fetch(user.id || user);
    const hasAdminPerms = guildUser.permissions.has(PermissionFlagsBits.Administrator);

    if (hasAdminPerms) {
        return true;
    }

    const { modroles } = await new GuildConfig().get(guild_id);
    const hasPermission = modroles.some(({ role, isAdmin, isMod, isHelper }) =>
        this.checkPerms({
            role_id: role,
            roleIsAdmin: isAdmin,
            roleIsMod: isMod,
            roleIsHelper: isHelper,
            user: guildUser,
            isDashboard,
            modOnly,
            adminOnly,
            bot,
        })
    );

    if (!hasPermission) {
        errorhandler({
            fatal: false,
            message: `${guildUser.id} has tried a command with no permission in ${guild_id}`,
            id: 1694433429,
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
    bot,
}) => {
    const userHasRole = isDashboard
        ? bot.guilds.cache.get(guild_id).members.cache.get(user).roles.cache.has(role_id)
        : user.roles.cache.has(role_id);

    if (
        !userHasRole ||
        (adminOnly && roleIsMod) ||
        ((modOnly || adminOnly) && roleIsHelper) ||
        (!roleIsAdmin && !roleIsMod && !roleIsHelper)
    ) {
        return false;
    }

    return true;
};
