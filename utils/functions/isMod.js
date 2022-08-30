const {
    getGuildConfig
} = require("./data/getConfig");

async function isMod({
    member,
    guild
}) {
    if (!member) return false;

    const {
        settings
    } = getGuildConfig({
        guild_id: guild.id
    })

    const modroles = JSON.parse(settings.modroles) || settings.modroles || [];

    var isMod = false
    for (let i in await modroles) {
        if (member.roles.cache.find(r => r.id === modroles[i].role) !== undefined) {
            isMod = true;
            break;
        }
    }
    return isMod;
}

module.exports = {
    isMod
}