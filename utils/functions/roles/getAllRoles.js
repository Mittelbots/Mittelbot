/**
 * 
 * @param {user} user
 */

async function getAllRoles(user) {
    let r = [];
    user.roles.cache.map(role => (role.name !== '@everyone') ? r.push(role.id) : '')
    return r;
}

module.exports = {getAllRoles};