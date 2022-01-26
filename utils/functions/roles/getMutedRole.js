const { createMutedRole } = require("./createMutedRole");

async function getMutedRole(message, guild) {
    let MutedRole;
    try {
        MutedRole = await guild.roles.cache.find(role => role.name === "Muted").id;
    } catch (err) {
        if(message !== null) {
            MutedRole = await createMutedRole(message);
        }
    }
    return MutedRole;
}

module.exports = {getMutedRole}