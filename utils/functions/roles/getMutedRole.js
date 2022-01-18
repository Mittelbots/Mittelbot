const { createMutedRole } = require("./createMutedRole");

async function getMutedRole(message) {
    let MutedRole;
    try {
        MutedRole = await message.guild.roles.cache.find(role => role.name === "Muted").id;
    } catch (err) {
        MutedRole = await createMutedRole(message);
    }
    return MutedRole;
}

module.exports = {getMutedRole}