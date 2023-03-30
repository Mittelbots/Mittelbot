/**
 *
 * @param {messag.member} member
 */

const { getMutedRole } = require('./getMutedRole');

async function removeAllRoles(member) {
    const mutedRole = await getMutedRole(member.guild);
    await member.roles.cache.forEach((role) => {
        if (role.name != '@everyone' && role.id !== mutedRole) {
            member.roles.remove(role).catch((err) => {
                /** NO PERMISSIONS */
            });
        }
    });
    return;
}

module.exports = { removeAllRoles };
