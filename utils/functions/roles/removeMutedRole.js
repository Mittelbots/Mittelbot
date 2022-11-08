const { getMutedRole } = require("./getMutedRole");

async function removeMutedRole(user, guild) {
<<<<<<< HEAD
    const MutedRole = await getMutedRole(guild);
    try {
        return await user.roles.remove([MutedRole]).catch((err) => {
            return false;
        });
    } catch (err) {
        return false;
    }
=======
    var MutedRole = await getMutedRole(guild);

    return await user.roles.remove([MutedRole]).catch(err => {/** CANT REMOVE ROLES (PERMISSION ERROR)*/})
>>>>>>> 3f3ba2cc101956b6e3b46b465fe39e90b376562f
}

module.exports = {removeMutedRole}