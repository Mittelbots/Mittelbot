/**
 * 
 * @param {messag.member} member 
 */

async function getAllRoles(member) {
    let r = [];
    member.roles.cache.forEach(role => (role.name !== '@everyone') ? r.push(role.id) : '')
    return r;
}

module.exports = {getAllRoles};