/**
 *
 * @param {JSON} user
 * @param {JSON} guild
 * @param {Array} roles
 */

const { errorhandler } = require('../errorhandler/errorhandler');

async function giveAllRoles(userId, guild, roles) {
    if (roles.length !== 0) {
        for (let x in roles) {
            try {
                const role = await guild.roles.cache.find((role) => role.id == roles[x]);
                const member = await guild.members.cache.get(userId);

                if (!role || !member) {
                    return;
                }
                member.roles
                    .add([role])
                    .then(() => {
                        errorhandler({
                            fatal: false,
                            message: `${userId} was given the roles back in ${guild.id}. ROLEID: ${roles[x]}`,
                            id: 1694433732,
                        });
                    })
                    .catch(() => {});
            } catch (err) {
                return errorhandler({ err });
            }
        }
    }
}

module.exports = { giveAllRoles };
