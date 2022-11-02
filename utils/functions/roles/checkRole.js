module.exports.checkRole = async ({ guild, role_id }) => {
    const role = guild.roles.cache.get(role_id);

    if (role) return true;
    else return false;
};
