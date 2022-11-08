const { getMutedRole } = require('./getMutedRole');

async function removeMutedRole(user, guild) {
    const MutedRole = await getMutedRole(guild);
    try {
        return await user.roles.remove([MutedRole]).catch((err) => {
            return false;
        });
    } catch (err) {
        return false;
    }
}

module.exports = { removeMutedRole };
