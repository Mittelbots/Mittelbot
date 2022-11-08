<<<<<<< HEAD
const { GuildConfig } = require('./data/Config');
=======
const {
    getGuildConfig
} = require("./data/getConfig");
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f

module.exports.isMod = async ({
    member,
    guild
}) => {
    if (!member) return false;

<<<<<<< HEAD
    const guildConfig = await GuildConfig.get(guild.id);
    const modroles = guildConfig.modroles;
=======
    const {
        settings
    } = await getGuildConfig({
        guild_id: guild.id
    })

    const modroles = JSON.parse(settings.modroles) || settings.modroles || [];
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f

    var isTeam = false
    for (let i in await modroles) {
        if (member.roles.cache.find(r => r.id === modroles[i].role) !== undefined) {
            isTeam = true;
            break;
        }
    }
    return isTeam;
}