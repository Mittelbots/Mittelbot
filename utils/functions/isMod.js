const { getGuildConfig } = require('./data/getConfig');

module.exports.isMod = async ({ member, guild }) => {
    if (!member) return false;

    const { settings } = await getGuildConfig({
        guild_id: guild.id,
    });

    const modroles = JSON.parse(settings.modroles) || settings.modroles || [];

    var isTeam = false;
    for (let i in await modroles) {
        if (member.roles.cache.find((r) => r.id === modroles[i].role) !== undefined) {
            isTeam = true;
            break;
        }
    }
    return isTeam;
};
