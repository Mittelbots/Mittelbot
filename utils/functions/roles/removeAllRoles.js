/**
 * 
 * @param {messag.member} member 
 */

async function removeAllRoles(member) {
    await member.roles.cache.forEach(role => (role.name !== '@everyone') ? member.roles.remove(role) : '')
    return;
}


module.exports = {removeAllRoles}