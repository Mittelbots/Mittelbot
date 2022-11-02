const { getMutedRole } = require('./getMutedRole');

async function removeMutedRole(user, guild) {
    var MutedRole = await getMutedRole(guild);

    return await user.roles.remove([MutedRole]).catch((err) => {
        /** CANT REMOVE ROLES (PERMISSION ERROR)*/
    });
}

module.exports = { removeMutedRole };
