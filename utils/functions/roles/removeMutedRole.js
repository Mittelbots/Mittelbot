const { getMutedRole } = require("./getMutedRole");

async function removeMutedRole(user, guild) {
    var MutedRole = await getMutedRole(null, guild);

    await user.roles.remove([MutedRole]).catch(err => {
        /**
         * CANT REMOVE ROLES (PERMISSION ERROR)
         */
    })
    return;
}

module.exports = {removeMutedRole}