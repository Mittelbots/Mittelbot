const { createMutedRole } = require('./createMutedRole');

async function getMutedRole(guild) {
    let MutedRole;
    try {
        MutedRole = await guild.roles.cache.find((role) => role.name === 'Muted').id;
    } catch (err) {
        MutedRole = await createMutedRole({ guild });
    }
    return MutedRole;
}

module.exports = { getMutedRole };
